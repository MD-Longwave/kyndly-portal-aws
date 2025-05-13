import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { QuoteService, checkApiHealth } from '../services/api.service';
import { Auth } from 'aws-amplify';

// TypeScript interfaces for components
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

interface FormLayoutProps {
  children: React.ReactNode;
}

// Form layout components
const FormSection: React.FC<FormSectionProps> = ({ title, description = '', children }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-dark dark:text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};

const FormLayout: React.FC<FormLayoutProps> = ({ children }) => {
  return <div className="space-y-6">{children}</div>;
};

const NewQuote: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  
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
    priorityLevel: 'earliest', // Default to 'Earliest Convenience'
    additionalNotes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const uploadFileToS3 = async (file: File, path: string): Promise<string> => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const result = await Storage.put(`${path}/${fileName}`, file, {
        contentType: file.type
      });
      return result.key;
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
    
    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting form submission...');
      
      // Get the authentication token before submitting the quote
      // This ensures the token is available before the API call
      let token;
      let tpaId = 'default-tpa-id';
      let employerId = 'default-employer-id';
      
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
        
        // Extract Employer ID from token
        if (payload['custom:employer_id']) {
          employerId = payload['custom:employer_id'];
          console.log(`Found custom:employer_id in token: ${employerId}`);
        } else {
          console.warn('No custom:employer_id found in token, using default');
        }
      } catch (authError) {
        console.error('Error getting authentication token:', authError);
        alert('Failed to authenticate. Please make sure you are logged in and try again.');
        setIsSubmitting(false);
        return;
      }
      
      console.log(`Using TPA ID: ${tpaId} and Employer ID: ${employerId}`);
      
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
        // Required for the backend API
        tpaId: tpaId,
        employerId: employerId,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark dark:text-white">Quoting Tool Submission Form</h1>
      </div>

      {apiConnected === false && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Connection Error! </strong>
          <span className="block sm:inline">Cannot connect to the backend server. Your form submission may fail.</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            {/* Rep Name */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection title="Rep">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Representative Name
                </label>
                <input
                  type="text"
                  name="transperraRep"
                  id="transperraRep"
                  placeholder="Enter representative name"
                  value={formData.transperraRep}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                />
              </FormSection>
            </div>

            {/* Contact Type */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection title="Contact Type">
                <div className="space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="contactTypeGLI"
                        name="contactTypeGLI"
                        type="checkbox"
                        checked={formData.contactTypeGLI}
                        onChange={handleCheckboxChange}
                        className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="contactTypeGLI" className="font-medium text-dark dark:text-white">GLI</label>
                    </div>
                  </div>
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="contactTypeNonGLI"
                        name="contactTypeNonGLI"
                        type="checkbox"
                        checked={formData.contactTypeNonGLI}
                        onChange={handleCheckboxChange}
                        className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="contactTypeNonGLI" className="font-medium text-dark dark:text-white">Non-GLI</label>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Company Name */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection title="Company Name">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] pr-3 pl-12 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                  />
                  <span className="absolute top-1/2 left-4 -translate-y-1/2">
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
                  </span>
                </div>
              </FormSection>
            </div>

            {/* Census File */}
            <div className="w-full px-4 mb-6">
              <FormSection 
                title="Census File" 
                description="Upload up to 5 supported files: PDF, document, image, or spreadsheet. Max 100 MB per file."
              >
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="censusFile"
                    name="censusFile"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e, 'censusFile')}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="censusFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                  >
                    <span className="inline-flex items-center px-4 py-2 border border-stroke shadow-sm text-sm font-medium rounded-md text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      Add file
                    </span>
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    {formData.censusFileName || 'No file selected'}
                  </span>
                </div>
              </FormSection>
            </div>

            {/* Plan Comparison Information */}
            <div className="w-full px-4 mb-6">
              <FormSection 
                title="Plan Comparison Information" 
                description="Upload up to 5 supported files: PDF, document, image, or spreadsheet. Max 100 MB per file."
              >
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="planComparisonFile"
                    name="planComparisonFile"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e, 'planComparisonFile')}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="planComparisonFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                  >
                    <span className="inline-flex items-center px-4 py-2 border border-stroke shadow-sm text-sm font-medium rounded-md text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      Add file
                    </span>
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    {formData.planComparisonFileName || 'No file selected'}
                  </span>
                </div>
              </FormSection>
            </div>

            {/* ICHRA Effective Date */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection title="ICHRA Effective Date">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Effective Date
                </label>
                <input
                  type="date"
                  name="ichraEffectiveDate"
                  id="ichraEffectiveDate"
                  value={formData.ichraEffectiveDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                />
              </FormSection>
            </div>

            {/* PEPM */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection title="PEPM (default $70)">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  PEPM Amount
                </label>
                <div className="flex items-center">
                  <span className="h-full rounded-tl-md rounded-bl-md border border-r-0 border-stroke dark:border-dark-3 bg-gray-100 dark:bg-dark-2 py-[10px] px-4 text-base uppercase text-body-color dark:text-dark-6">
                    $
                  </span>
                  <input
                    type="text"
                    name="pepm"
                    id="pepm"
                    value={formData.pepm}
                    onChange={handleChange}
                    className="w-full bg-transparent rounded-br-md rounded-tr-md border border-stroke dark:border-dark-3 py-[10px] pr-3 pl-5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                  />
                </div>
              </FormSection>
            </div>

            {/* Current Funding Strategy */}
            <div className="w-full px-4 mb-6">
              <FormSection 
                title="Current Funding Strategy" 
                description="How does the employer currently contribute to their group health plan?"
              >
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Funding Details
                </label>
                <textarea
                  name="currentFundingStrategy"
                  id="currentFundingStrategy"
                  rows={3}
                  value={formData.currentFundingStrategy}
                  onChange={handleChange}
                  className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                />
              </FormSection>
            </div>

            {/* Target Plan: Deductible */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection 
                title="Target Plan: Deductible" 
                description="What individual deductible would be ideal?"
              >
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Deductible Amount
                </label>
                <select
                  id="targetDeductible"
                  name="targetDeductible"
                  value={formData.targetDeductible}
                  onChange={handleChange}
                  className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                >
                  <option value="">Choose</option>
                  <option value="0">$0</option>
                  <option value="500">$500</option>
                  <option value="1000">$1,000</option>
                  <option value="1500">$1,500</option>
                  <option value="2000">$2,000</option>
                  <option value="2500">$2,500</option>
                  <option value="3000">$3,000</option>
                  <option value="4000">$4,000</option>
                  <option value="5000">$5,000</option>
                  <option value="6000">$6,000</option>
                  <option value="7000">$7,000</option>
                  <option value="8000">$8,000</option>
                  <option value="9000">$9,000</option>
                  <option value="10000">$10,000</option>
                </select>
              </FormSection>
            </div>

            {/* Target Plan: HSA? */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection title="Target Plan: HSA?">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  HSA Plan
                </label>
                <select
                  id="targetHSA"
                  name="targetHSA"
                  value={formData.targetHSA}
                  onChange={handleChange}
                  className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                >
                  <option value="">Choose</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="either">Either</option>
                </select>
              </FormSection>
            </div>

            {/* Broker Name */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection title="Broker Name">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Broker's Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="brokerName"
                    id="brokerName"
                    placeholder="Enter broker name"
                    value={formData.brokerName}
                    onChange={handleChange}
                    className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] pr-3 pl-12 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                  />
                  <span className="absolute top-1/2 left-4 -translate-y-1/2">
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
                  </span>
                </div>
              </FormSection>
            </div>

            {/* Broker Email Address */}
            <div className="w-full px-4 md:w-1/2 mb-6">
              <FormSection title="Broker Email Address">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Broker's Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="brokerEmail"
                    id="brokerEmail"
                    placeholder="broker@example.com"
                    value={formData.brokerEmail}
                    onChange={handleChange}
                    className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] pr-3 pl-12 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                  />
                  <span className="absolute top-1/2 left-4 -translate-y-1/2">
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
                  </span>
                </div>
              </FormSection>
            </div>

            {/* Level of Priority */}
            <div className="w-full px-4 mb-6">
              <FormSection title="Level of Priority">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Priority Level
                </label>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="asap"
                      name="priorityLevel"
                      type="radio"
                      value="asap"
                      checked={formData.priorityLevel === 'asap'}
                      onChange={handleChange}
                      className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                    />
                    <label htmlFor="asap" className="ml-3 block text-sm font-medium text-dark dark:text-white">
                      ASAP
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="earliest"
                      name="priorityLevel"
                      type="radio"
                      value="earliest"
                      checked={formData.priorityLevel === 'earliest'}
                      onChange={handleChange}
                      className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                    />
                    <label htmlFor="earliest" className="ml-3 block text-sm font-medium text-dark dark:text-white">
                      Earliest Convenience
                    </label>
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Additional Notes */}
            <div className="w-full px-4 mb-6">
              <FormSection title="Additional Notes">
                <label className="mb-[10px] block text-base font-medium text-dark dark:text-white">
                  Additional Information
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
                />
              </FormSection>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Link
            to="/quotes"
            className="inline-flex justify-center py-2 px-4 border border-stroke shadow-sm text-sm font-medium rounded-md text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </Link>
          <button
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
              priorityLevel: 'earliest',
              additionalNotes: ''
            })}
            className="inline-flex justify-center py-2 px-4 border border-stroke shadow-sm text-sm font-medium rounded-md text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Clear form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewQuote; 