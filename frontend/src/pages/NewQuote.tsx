import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { QuoteService, checkApiHealth } from '../services/api.service';
import { Auth } from 'aws-amplify';
import {
  FormSection,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  FileInput,
  Button,
  CurrencyInput
} from '../components/ui/FormElements';
import { useAuth } from '../contexts/AuthContext';

// Icon components for inputs
const CompanyIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity={0.8}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.33398 6.66667C2.87375 6.66667 2.50065 7.03976 2.50065 7.5V15.8333C2.50065 16.2936 2.87375 16.6667 3.33398 16.6667H16.6673C17.1276 16.6667 17.5007 16.2936 17.5007 15.8333V7.5C17.5007 7.03976 17.1276 6.66667 16.6673 6.66667H3.33398ZM0.833984 7.5C0.833984 6.11929 1.95327 5 3.33398 5H16.6673C18.048 5 19.1673 6.11929 19.1673 7.5V15.8333C19.1673 17.214 18.048 18.3333 16.6673 18.3333H3.33398C1.95327 18.3333 0.833984 17.214 0.833984 15.8333V7.5Z"
        fill="#9CA3AF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.56622 2.39825C7.03506 1.92941 7.67094 1.66602 8.33398 1.66602H11.6673C12.3304 1.66602 12.9662 1.92941 13.4351 2.39825C13.9039 2.86709 14.1673 3.50297 14.1673 4.16602V17.4993C14.1673 17.9596 13.7942 18.3327 13.334 18.3327C12.8737 18.3327 12.5006 17.9596 12.5006 17.4993V4.16602C12.5006 3.945 12.4129 3.73304 12.2566 3.57676C12.1003 3.42048 11.8883 3.33268 11.6673 3.33268H8.33398C8.11297 3.33268 7.90101 3.42048 7.74473 3.57676C7.58845 3.73304 7.50065 3.945 7.50065 4.16602V17.4993C7.50065 17.9596 7.12755 18.3327 6.66732 18.3327C6.20708 18.3327 5.83398 17.9596 5.83398 17.4993V4.16602C5.83398 3.50297 6.09738 2.86709 6.56622 2.39825Z"
        fill="#9CA3AF"
      />
    </g>
  </svg>
);

const PersonIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.72 12.886a4.167 4.167 0 0 1 2.947-1.22h6.666a4.167 4.167 0 0 1 4.167 4.167v1.666a.833.833 0 1 1-1.667 0v-1.666a2.5 2.5 0 0 0-2.5-2.5H6.667a2.5 2.5 0 0 0-2.5 2.5v1.666a.833.833 0 1 1-1.667 0v-1.666a4.17 4.17 0 0 1 1.22-2.947ZM10 3.333a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm-4.166 2.5a4.167 4.167 0 1 1 8.333 0 4.167 4.167 0 0 1-8.333 0Z"
      opacity={0.8}
      fillRule="evenodd"
      clipRule="evenodd"
      fill="#9CA3AF"
    />
  </svg>
);

const EmailIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity={0.8} fillRule="evenodd" clipRule="evenodd" fill="#9CA3AF">
      <path d="M3.334 4.167A.838.838 0 0 0 2.501 5v10c0 .456.377.833.833.833h13.333a.838.838 0 0 0 .834-.833V5a.838.838 0 0 0-.834-.833H3.334ZM.834 5c0-1.377 1.123-2.5 2.5-2.5h13.333c1.377 0 2.5 1.123 2.5 2.5v10c0 1.377-1.123 2.5-2.5 2.5H3.334a2.505 2.505 0 0 1-2.5-2.5V5Z" />
      <path d="M.985 4.522a.833.833 0 0 1 1.16-.205l7.856 5.499 7.855-5.5a.833.833 0 1 1 .956 1.366l-8.333 5.833a.833.833 0 0 1-.956 0L1.19 5.682a.833.833 0 0 1-.205-1.16Z" />
    </g>
  </svg>
);

// Update the CONFIG_API_URL to use the main API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://3ein5nfb8k.execute-api.us-east-2.amazonaws.com/dev';

interface BrokerOption {
  id: string;
  name: string;
}

interface EmployerOption {
  id: string;
  name: string;
}

interface TpaData {
  id: string;
  name: string;
  brokers: {
    id: string;
    name: string;
    employers: {
      id: string;
      name: string;
    }[];
  }[];
}

const NewQuote: React.FC = () => {
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [tpaData, setTpaData] = useState<TpaData | null>(null);
  const [loadingTpaData, setLoadingTpaData] = useState(false);
  const [brokers, setBrokers] = useState<BrokerOption[]>([]);
  const [employers, setEmployers] = useState<EmployerOption[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Check API connection when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await checkApiHealth();
        setApiConnected(isHealthy);
        
        if (!isHealthy) {
          console.error('API health check failed. Backend may not be available.');
        }
      } catch (error) {
        console.error('Error checking API health:', error);
        setApiConnected(false);
      }
    };
    
    checkConnection();
  }, []);
  
  // Fetch TPA data including brokers and employers
  useEffect(() => {
    const fetchTpaData = async () => {
      try {
        setLoadingTpaData(true);
        setDataError(null);
        
        // Get the authentication token
        const token = await getIdToken();
        if (!token) {
          throw new Error("Authentication token not available");
        }
        
        console.log('NewQuote: Fetching TPA data from API');
        
        // Add timestamp to prevent caching and always get fresh data
        const timestamp = new Date().getTime();
        
        // Fetch TPA data from the configuration API
        const response = await fetch(`${API_URL}/api/tpa?t=${timestamp}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('NewQuote: TPA data received:', data);
        setTpaData(data);
        
        // Set available brokers
        if (data && data.brokers && Array.isArray(data.brokers)) {
          console.log(`NewQuote: Found ${data.brokers.length} brokers in TPA data`);
          
          const brokerOptions = data.brokers.map((broker: any) => ({
            id: broker.id,
            name: broker.name
          }));
          
          console.log('NewQuote: Broker options:', brokerOptions);
          setBrokers(brokerOptions);
          
          // If user is a broker, pre-select their broker
          if (user?.brokerId) {
            console.log(`NewQuote: User is a broker with ID ${user.brokerId}, pre-selecting`);
            const userBroker = brokerOptions.find((broker: BrokerOption) => broker.id === user.brokerId);
            if (userBroker) {
              console.log('NewQuote: Found matching broker for user, setting form data');
              setFormData(prev => ({
                ...prev,
                brokerId: user.brokerId || ''
              }));
              
              // Load employers for this broker
              const selectedBroker = data.brokers.find((b: any) => b.id === user.brokerId);
              if (selectedBroker && selectedBroker.employers && Array.isArray(selectedBroker.employers)) {
                console.log(`NewQuote: Found ${selectedBroker.employers.length} employers for broker ${user.brokerId}`);
                
                const employerOptions = selectedBroker.employers.map((emp: any) => ({
                  id: emp.id,
                  name: emp.name
                }));
                
                console.log('NewQuote: Employer options:', employerOptions);
                setEmployers(employerOptions);
                
                // If user is an employer, pre-select their employer
                if (user?.employerId) {
                  console.log(`NewQuote: User is an employer with ID ${user.employerId}, pre-selecting`);
                  setFormData(prev => ({
                    ...prev,
                    employerId: user.employerId || ''
                  }));
                }
              } else {
                console.log('NewQuote: No employers found for broker or invalid data structure');
                setEmployers([]);
              }
            } else {
              console.log(`NewQuote: Broker ID ${user.brokerId} not found in available brokers`);
            }
          } else {
            console.log('NewQuote: User is not a broker, no pre-selection needed');
          }
        } else {
          console.warn('NewQuote: No brokers found in TPA data or invalid data structure');
          setBrokers([]);
          setEmployers([]);
        }
      } catch (error) {
        console.error('Error fetching TPA data:', error);
        setDataError(`Failed to load broker/employer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setBrokers([]);
        setEmployers([]);
      } finally {
        setLoadingTpaData(false);
      }
    };
    
    fetchTpaData();
  }, [user, getIdToken]);
  
  const [formData, setFormData] = useState({
    transperraRep: '',
    contactTypeGLI: false,
    contactTypeNonGLI: false,
    companyName: '',
    censusFile: null as File | null,
    censusFileName: '',
    planComparisonFile: null as File | null,
    planComparisonFileName: '',
    ichraEffectiveDate: '',
    pepm: '70', // Default value as per form
    currentFundingStrategy: '',
    targetDeductible: '',
    targetHSA: '',
    brokerName: '',
    brokerEmail: '',
    brokerId: '', // Added for broker selection
    employerId: '', // Added for employer selection
    priorityLevel: 'earliest', // Default to 'Earliest Convenience'
    additionalNotes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If broker changes, update employer options and reset employerId
    if (name === 'brokerId') {
      console.log(`NewQuote: Broker changed to ${value}, updating employers`);
      
      setFormData(prev => ({
        ...prev,
        employerId: '' // Reset employer selection when broker changes
      }));
      
      if (!value) {
        console.log('NewQuote: No broker selected, clearing employers');
        setEmployers([]);
        return;
      }
      
      const selectedBroker = tpaData?.brokers?.find(broker => broker.id === value);
      
      if (selectedBroker && selectedBroker.employers && Array.isArray(selectedBroker.employers)) {
        console.log(`NewQuote: Found ${selectedBroker.employers.length} employers for broker ${value}`);
        
        const employerOptions = selectedBroker.employers.map(employer => ({
          id: employer.id,
          name: employer.name
        }));
        
        console.log('NewQuote: Setting employer options:', employerOptions);
        setEmployers(employerOptions);
      } else {
        console.log(`NewQuote: No employers found for broker ${value} or invalid data structure`);
        setEmployers([]);
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}Name`]: file.name
      }));
    }
  };

  const uploadFileToS3 = async (file: File, type: string): Promise<string> => {
    try {
      // Get TPA ID from user
      const tpaId = user?.tpaId || 'unknown';
      const brokerId = formData.brokerId || 'unknown';
      const employerId = formData.employerId || 'unknown';
      
      // Create structured path for uploads
      const path = `submissions/${tpaId}/${brokerId}/${employerId}/${type}/${Date.now()}_${file.name}`;
      
      await Storage.put(path, file, {
        contentType: file.type,
        progressCallback: (progress: any) => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        },
      });
      
      return path;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    // Check required fields
    if (!formData.transperraRep) {
      alert('Please enter a Rep name');
      return;
    }
    
    if (!formData.companyName) {
      alert('Please enter a Company Name');
      return;
    }
    
    if (!formData.ichraEffectiveDate) {
      alert('Please select an ICHRA Effective Date');
      return;
    }
    
    // Check broker and employer selection
    if (!formData.brokerId) {
      alert('Please select a Broker');
      return;
    }
    
    if (!formData.employerId) {
      alert('Please select an Employer');
      return;
    }
    
    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting form submission...');
      
      // Get the authentication token before submitting the quote
      // This ensures the token is available before the API call
      let token;
      let tpaId = 'default-tpa-id';
      
      try {
        const session = await Auth.currentSession();
        token = session.getIdToken().getJwtToken();
        console.log('Successfully retrieved auth token before form submission');
        
        // Extract custom attributes directly from token
        const payload = session.getIdToken().decodePayload();
        console.log('Token payload for debugging:', payload);
        
        // Extract TPA ID from token
        if (payload['custom:tpa_id']) {
          tpaId = payload['custom:tpa_id'];
          console.log(`Found custom:tpa_id in token: ${tpaId}`);
        } else {
          console.warn('No custom:tpa_id found in token, using default');
        }
      } catch (authError) {
        console.error('Error getting authentication token:', authError);
        alert('Failed to authenticate. Please make sure you are logged in and try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Log the selected broker and employer
      console.log(`Selected Broker ID: ${formData.brokerId}`);
      console.log(`Selected Employer ID: ${formData.employerId}`);
      
      // Prepare data for API
      const quoteData = {
        transperraRep: formData.transperraRep,
        contactType: formData.contactTypeGLI ? 'GLI' : (formData.contactTypeNonGLI ? 'Non-GLI' : ''),
        companyName: formData.companyName,
        ichraEffectiveDate: formData.ichraEffectiveDate,
        pepm: formData.pepm,
        currentFundingStrategy: formData.currentFundingStrategy,
        targetDeductible: formData.targetDeductible,
        targetHSA: formData.targetHSA,
        brokerName: formData.brokerName,
        brokerEmail: formData.brokerEmail,
        priorityLevel: formData.priorityLevel,
        additionalNotes: formData.additionalNotes,
        // Add the broker and employer IDs from the dropdowns
        tpaId: tpaId,
        brokerId: formData.brokerId,
        employerId: formData.employerId,
        isGLI: formData.contactTypeGLI,
        // Include the actual file objects
        censusFile: formData.censusFile,
        planComparisonFile: formData.planComparisonFile,
        // Include auth token to ensure it's passed to the API service
        authToken: token
      };
      
      console.log('Submitting quote data to API:', quoteData);
      
      // Submit quote using the API service
      try {
        const result = await QuoteService.submitQuote(quoteData);
        console.log('API response:', result);
        
        // Show success message
        alert('Quote submitted successfully!');
        
        // Redirect to quotes list after submission
        navigate('/quotes');
      } catch (apiError: any) {
        console.error('API error during submission:', apiError);
        alert(`Failed to submit quote: ${apiError.message || 'Unknown error'}. Please check the browser console for more details.`);
      }
    } catch (error: any) {
      console.error('Error in form submission process:', error);
      // Show more detailed error message
      alert(`Error in form submission: ${error.message || 'Unknown error'}. Please check the browser console for more details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Target deductible options for select component
  const deductibleOptions = [
    { value: '', label: 'Choose' },
    { value: '0', label: '$0' },
    { value: '500', label: '$500' },
    { value: '1000', label: '$1,000' },
    { value: '1500', label: '$1,500' },
    { value: '2000', label: '$2,000' },
    { value: '2500', label: '$2,500' },
    { value: '3000', label: '$3,000' },
    { value: '4000', label: '$4,000' },
    { value: '5000', label: '$5,000' },
    { value: '6000', label: '$6,000' },
    { value: '7000', label: '$7,000' },
    { value: '8000', label: '$8,000' },
    { value: '9000', label: '$9,000' },
    { value: '10000', label: '$10,000' },
  ];

  // HSA options for select component
  const hsaOptions = [
    { value: '', label: 'Choose' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'either', label: 'Either' },
  ];

  // Update employers when broker changes
  const handleBrokerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brokerId = e.target.value;
    console.log(`NewQuote: handleBrokerChange called with brokerId ${brokerId}`);
    
    // Call the existing handleChange function to maintain consistency
    handleChange(e);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <div className="bg-brand-gradient rounded-brand p-6 mb-8 text-white shadow-brand">
        <h1 className="text-3xl font-bold mb-2">Quoting Tool Submission Form</h1>
        <p className="text-sky-100">Complete the form below to request a new ICHRA quote</p>
      </div>

      {apiConnected === false && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-brand relative mb-6" role="alert">
          <strong className="font-bold">Connection Error! </strong>
          <span className="block sm:inline">Cannot connect to the backend server. Your form submission may fail.</span>
        </div>
      )}
      
      {dataError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-brand relative mb-6" role="alert">
          <strong className="font-bold">Data Loading Error! </strong>
          <span className="block sm:inline">{dataError}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Representative Information">
          <div className="grid gap-6 mb-4">
            <Input
              label="Representative Name"
              name="transperraRep"
              id="transperraRep"
              placeholder="Enter representative name"
              value={formData.transperraRep}
              onChange={handleChange}
              icon={<PersonIcon />}
              required
            />
            
            <div className="space-y-2">
              <label className="block text-base font-medium text-night dark:text-white">
                Contact Type
              </label>
              <div className="space-y-2">
                <Checkbox
                  label="GLI"
                  id="contactTypeGLI"
                  name="contactTypeGLI"
                  checked={formData.contactTypeGLI}
                  onChange={handleCheckboxChange}
                />
                <Checkbox
                  label="Non-GLI"
                  id="contactTypeNonGLI"
                  name="contactTypeNonGLI"
                  checked={formData.contactTypeNonGLI}
                  onChange={handleCheckboxChange}
                />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Company Information">
          <div className="grid gap-6 mb-4">
            <Input
              label="Company Name"
              name="companyName"
              id="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              icon={<CompanyIcon />}
              required
            />
            
            {/* Broker Selection */}
            <div className="space-y-2">
              <label className="block text-base font-medium text-night dark:text-white">
                Broker
              </label>
              <Select
                label="Broker"
                name="brokerId"
                value={formData.brokerId}
                onChange={handleBrokerChange}
                required
                disabled={loadingTpaData}
                options={[
                  { value: "", label: loadingTpaData ? "Loading brokers..." : "Select Broker" },
                  ...brokers.map(broker => ({ value: broker.id, label: broker.name }))
                ]}
              />
              {brokers.length === 0 && !loadingTpaData && (
                <p className="text-sm text-red-500 mt-1">No brokers available. Please contact an administrator.</p>
              )}
            </div>
            
            {/* Employer Selection - Only enabled if broker is selected */}
            <div className="space-y-2">
              <label className="block text-base font-medium text-night dark:text-white">
                Employer
              </label>
              <Select
                label="Employer"
                name="employerId"
                value={formData.employerId}
                onChange={handleChange}
                required
                disabled={loadingTpaData || !formData.brokerId}
                options={[
                  { value: "", label: loadingTpaData ? "Loading employers..." : "Select Employer" },
                  ...employers.map(employer => ({ value: employer.id, label: employer.name }))
                ]}
              />
              {formData.brokerId && employers.length === 0 && !loadingTpaData && (
                <p className="text-sm text-red-500 mt-1">No employers found for this broker. Please add an employer first.</p>
              )}
            </div>
            
            <FileInput
              label="Census File"
              description="Upload up to 5 supported files: PDF, document, image, or spreadsheet. Max 100 MB per file."
              id="censusFile"
              onChange={(e) => handleFileChange(e, 'censusFile')}
              fileName={formData.censusFileName}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            
            <FileInput
              label="Plan Comparison Information"
              description="Upload up to 5 supported files: PDF, document, image, or spreadsheet. Max 100 MB per file."
              id="planComparisonFile"
              onChange={(e) => handleFileChange(e, 'planComparisonFile')}
              fileName={formData.planComparisonFileName}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
          </div>
        </FormSection>

        <FormSection title="ICHRA Details">
          <div className="grid gap-6 mb-4">
            <Input
              label="ICHRA Effective Date"
              type="date"
              name="ichraEffectiveDate"
              id="ichraEffectiveDate"
              value={formData.ichraEffectiveDate}
              onChange={handleChange}
              required
            />
            
            <CurrencyInput
              label="PEPM Amount (default $70)"
              name="pepm"
              id="pepm"
              value={formData.pepm}
              onChange={handleChange}
            />
            
            <Textarea
              label="Current Funding Strategy"
              name="currentFundingStrategy"
              id="currentFundingStrategy"
              rows={3}
              value={formData.currentFundingStrategy}
              onChange={handleChange}
              placeholder="How does the employer currently contribute to their group health plan?"
            />
            
            <Select
              label="Target Plan: Deductible"
              name="targetDeductible"
              id="targetDeductible"
              value={formData.targetDeductible}
              onChange={handleChange}
              options={deductibleOptions}
            />
            
            <Select
              label="Target Plan: HSA?"
              name="targetHSA"
              id="targetHSA"
              value={formData.targetHSA}
              onChange={handleChange}
              options={hsaOptions}
            />
          </div>
        </FormSection>

        <FormSection title="Broker Information">
          <div className="grid gap-6 mb-4">
            <Input
              label="Broker Name"
              name="brokerName"
              id="brokerName"
              placeholder="Enter broker name"
              value={formData.brokerName}
              onChange={handleChange}
              icon={<PersonIcon />}
            />
            
            <Input
              label="Broker Email Address"
              type="email"
              name="brokerEmail"
              id="brokerEmail"
              placeholder="broker@example.com"
              value={formData.brokerEmail}
              onChange={handleChange}
              icon={<EmailIcon />}
            />
          </div>
        </FormSection>

        <FormSection title="Priority Level">
          <div className="grid gap-6 mb-4">
            <div className="space-y-2">
              <label className="block text-base font-medium text-night dark:text-white">
                Level of Priority
              </label>
              <div className="space-y-2">
                <Radio
                  label="ASAP"
                  id="asap"
                  name="priorityLevel"
                  value="asap"
                  checked={formData.priorityLevel === 'asap'}
                  onChange={handleChange}
                />
                <Radio
                  label="Earliest Convenience"
                  id="earliest"
                  name="priorityLevel"
                  value="earliest"
                  checked={formData.priorityLevel === 'earliest'}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <Textarea
              label="Additional Notes"
              name="additionalNotes"
              id="additionalNotes"
              rows={3}
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Any additional information or special requirements"
            />
          </div>
        </FormSection>

        {/* Broker and Employer Selection */}
        <FormSection title="Account Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Only show broker selection if user is not a broker */}
            {(!user?.brokerId || user?.role === 'admin' || user?.role === 'tpa_admin' || user?.role === 'tpa_user' || user?.role === 'tpa') && (
              <div>
                <Select
                  label="Broker"
                  name="brokerId"
                  value={formData.brokerId}
                  onChange={handleBrokerChange}
                  required
                  disabled={loadingTpaData}
                  options={[
                    { value: "", label: loadingTpaData ? "Loading brokers..." : "Select Broker" },
                    ...brokers.map(broker => ({ value: broker.id, label: broker.name }))
                  ]}
                />
                {brokers.length === 0 && !loadingTpaData && (
                  <p className="text-sm text-red-500 mt-1">No brokers available. Please contact an administrator.</p>
                )}
              </div>
            )}
            
            {/* Only show employer selection if user is not an employer and a broker is selected */}
            {formData.brokerId && (!user?.employerId || user?.role === 'admin' || user?.role === 'tpa_admin' || user?.role === 'tpa_user' || user?.role === 'tpa' || user?.role === 'broker') && (
              <div>
                <Select
                  label="Employer"
                  name="employerId"
                  value={formData.employerId}
                  onChange={handleChange}
                  required
                  disabled={loadingTpaData || !formData.brokerId}
                  options={[
                    { value: "", label: loadingTpaData ? "Loading employers..." : "Select Employer" },
                    ...employers.map(employer => ({ value: employer.id, label: employer.name }))
                  ]}
                />
                {formData.brokerId && employers.length === 0 && !loadingTpaData && (
                  <p className="text-sm text-red-500 mt-1">No employers found for this broker. Please add an employer first.</p>
                )}
              </div>
            )}
          </div>
        </FormSection>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Link to="/quotes">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            type="button"
            onClick={() => setFormData({
              transperraRep: '',
              contactTypeGLI: false,
              contactTypeNonGLI: false,
              companyName: '',
              censusFile: null,
              censusFileName: '',
              planComparisonFile: null,
              planComparisonFileName: '',
              ichraEffectiveDate: '',
              pepm: '70',
              currentFundingStrategy: '',
              targetDeductible: '',
              targetHSA: '',
              brokerName: '',
              brokerEmail: '',
              brokerId: '',
              employerId: '',
              priorityLevel: 'earliest',
              additionalNotes: ''
            })}
          >
            Clear form
          </Button>
          
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting || (!formData.brokerId || !formData.employerId)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quote'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewQuote; 