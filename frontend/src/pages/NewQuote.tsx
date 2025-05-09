import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { QuoteService, checkApiHealth } from '../services/api.service';
import { Auth } from 'aws-amplify';

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quoting Tool Submission Form</h1>
      </div>

      {apiConnected === false && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Connection Error! </strong>
          <span className="block sm:inline">Cannot connect to the backend server. Your form submission may fail.</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rep */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Rep</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <input
                type="text"
                name="transperraRep"
                id="transperraRep"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.transperraRep}
                onChange={handleChange}
                required
                placeholder="Enter representative name"
              />
            </div>
          </div>
        </div>

        {/* Contact Type */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Type</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="contactTypeGLI"
                    name="contactTypeGLI"
                    type="checkbox"
                    checked={formData.contactTypeGLI}
                    onChange={handleCheckboxChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-500 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="contactTypeGLI" className="font-medium text-gray-700">GLI</label>
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
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-500 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="contactTypeNonGLI" className="font-medium text-gray-700">Non-GLI</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Company Name</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <input
                type="text"
                name="companyName"
                id="companyName"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Census File */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Census File</h3>
            <p className="mt-1 text-sm text-gray-500">Upload up to 5 supported files: PDF, document, image, or spreadsheet. Max 100 MB per file.</p>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
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
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
              >
                <span className="inline-flex items-center px-4 py-2 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Add file
                </span>
              </label>
              <span className="ml-3 text-sm text-gray-500">
                {formData.censusFileName || 'No file selected'}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Comparison Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Plan Comparison Information</h3>
            <p className="mt-1 text-sm text-gray-500">Upload up to 5 supported files: PDF, document, image, or spreadsheet. Max 100 MB per file.</p>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
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
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
              >
                <span className="inline-flex items-center px-4 py-2 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Add file
                </span>
              </label>
              <span className="ml-3 text-sm text-gray-500">
                {formData.planComparisonFileName || 'No file selected'}
              </span>
            </div>
          </div>
        </div>

        {/* ICHRA Effective Date */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">ICHRA Effective Date</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <input
                type="date"
                name="ichraEffectiveDate"
                id="ichraEffectiveDate"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.ichraEffectiveDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* PEPM */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">PEPM (default $70)</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <input
                type="text"
                name="pepm"
                id="pepm"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.pepm}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Current Funding Strategy */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Current Funding Strategy</h3>
            <p className="mt-1 text-sm text-gray-500">How does the employer currently contribute to their group health plan?</p>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <textarea
                name="currentFundingStrategy"
                id="currentFundingStrategy"
                rows={3}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.currentFundingStrategy}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Target Plan: Deductible */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Target Plan: Deductible</h3>
            <p className="mt-1 text-sm text-gray-500">What individual deductible would be ideal?</p>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <select
                id="targetDeductible"
                name="targetDeductible"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.targetDeductible}
                onChange={handleChange}
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
            </div>
          </div>
        </div>

        {/* Target Plan: HSA? */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Target Plan: HSA?</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <select
                id="targetHSA"
                name="targetHSA"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.targetHSA}
                onChange={handleChange}
              >
                <option value="">Choose</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="either">Either</option>
              </select>
            </div>
          </div>
        </div>

        {/* Broker Name */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Broker Name</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <input
                type="text"
                name="brokerName"
                id="brokerName"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.brokerName}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Broker Email Address */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Broker Email Address</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <input
                type="email"
                name="brokerEmail"
                id="brokerEmail"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.brokerEmail}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Level of Priority */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Level of Priority</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="asap"
                  name="priorityLevel"
                  type="radio"
                  value="asap"
                  checked={formData.priorityLevel === 'asap'}
                  onChange={handleChange}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-500"
                />
                <label htmlFor="asap" className="ml-3 block text-sm font-medium text-gray-700">
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
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-500"
                />
                <label htmlFor="earliest" className="ml-3 block text-sm font-medium text-gray-700">
                  Earliest Convenience
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Notes</h3>
          </div>
          <div className="border-t border-gray-300 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                rows={3}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-500 rounded-md"
                value={formData.additionalNotes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            to="/quotes"
            className="inline-flex justify-center py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
            className="inline-flex justify-center py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Clear form
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewQuote; 