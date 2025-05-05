import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Mock employer data
const mockEmployers = [
  { id: 'emp1', name: 'Acme Corporation' },
  { id: 'emp2', name: 'Globex Inc.' },
  { id: 'emp3', name: 'Initech' },
  { id: 'emp4', name: 'Stark Industries' },
  { id: 'emp5', name: 'Wayne Enterprises' }
];

// Report types
const reportTypes = [
  { id: 'summary', name: 'Employer Summary', description: 'Overview of employer, plans, and costs' },
  { id: 'utilization', name: 'Utilization Report', description: 'Analysis of plan usage and trends' },
  { id: 'compliance', name: 'Compliance Analysis', description: 'ACA and ERISA compliance status' },
  { id: 'financial', name: 'Financial Breakdown', description: 'Detailed cost analysis and projections' }
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport: (employerId: string, reportType: string) => void;
}

export default function ReportModal({ isOpen, onClose, onGenerateReport }: ReportModalProps) {
  const [selectedEmployer, setSelectedEmployer] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGenerate = () => {
    if (!selectedEmployer || !selectedReportType) return;
    
    setIsLoading(true);
    // Simulate report generation delay
    setTimeout(() => {
      onGenerateReport(selectedEmployer, selectedReportType);
      setIsLoading(false);
      onClose();
      
      // Reset form
      setSelectedEmployer('');
      setSelectedReportType('');
    }, 1500);
  };
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Generate Report
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Select an employer and report type to generate a detailed report.
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="employer" className="block text-sm font-medium text-gray-700">
                          Employer
                        </label>
                        <select
                          id="employer"
                          name="employer"
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          value={selectedEmployer}
                          onChange={(e) => setSelectedEmployer(e.target.value)}
                        >
                          <option value="">Select an employer</option>
                          {mockEmployers.map((employer) => (
                            <option key={employer.id} value={employer.id}>
                              {employer.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Report Type
                        </label>
                        <div className="mt-2 space-y-2">
                          {reportTypes.map((reportType) => (
                            <div 
                              key={reportType.id} 
                              className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                                selectedReportType === reportType.id 
                                  ? 'border-primary-500 ring-2 ring-primary-500' 
                                  : 'border-gray-300'
                              }`}
                              onClick={() => setSelectedReportType(reportType.id)}
                            >
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center">
                                  <div className="text-sm">
                                    <p className="font-medium text-gray-900">{reportType.name}</p>
                                    <p className="text-gray-500">{reportType.description}</p>
                                  </div>
                                </div>
                                {selectedReportType === reportType.id && (
                                  <div className="shrink-0 text-primary-600">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2"
                    onClick={handleGenerate}
                    disabled={!selectedEmployer || !selectedReportType || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Generate Report'
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 