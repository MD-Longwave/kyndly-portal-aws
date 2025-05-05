import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Define types for our data
interface EnrollmentSummaryRow {
  company: string;
  eeOnly: number;
  eePlusSP: number;
  eePlusCH: number;
  family: number;
  other: number;
  total: number;
}

interface PlanSelectionItem {
  name: string;
  percentage: number;
  color: string;
}

interface BenAdminReportRow {
  id: string;
  relationship: string;
  m: string;
  mid: string;
  mem: string;
  gender: string;
  fullName: string;
  totalPremium: number;
  memberPremium: number;
  issuer: number | string;
  selectedPlan: string;
  effectiveDate: string;
  appType: string;
  t: number | string;
  s: string;
  en: string;
  c: string;
  name: string;
  member: string;
  email: string;
  ein: string;
}

interface EnrollmentData {
  totalEnrolled: number;
  enrollmentSummary: EnrollmentSummaryRow[];
  planSelection: PlanSelectionItem[];
  benAdminReport: BenAdminReportRow[];
}

// Mock data for enrollment dashboard
const enrollmentData: EnrollmentData = {
  totalEnrolled: 428,
  enrollmentSummary: [
    { company: 'USe Transportation', eeOnly: 4, eePlusSP: 2, eePlusCH: 0, family: 1, other: 0, total: 7 },
    { company: 'TestCorp Systems', eeOnly: 2, eePlusSP: 1, eePlusCH: 0, family: 0, other: 0, total: 3 },
    { company: 'Ortiz Consulting', eeOnly: 3, eePlusSP: 0, eePlusCH: 0, family: 2, other: 0, total: 5 },
    { company: 'Occidental Health', eeOnly: 1, eePlusSP: 0, eePlusCH: 0, family: 0, other: 0, total: 1 },
    { company: 'Oasis Wellness', eeOnly: 6, eePlusSP: 0, eePlusCH: 0, family: 1, other: 0, total: 7 },
    { company: 'LightPath Media', eeOnly: 2, eePlusSP: 0, eePlusCH: 0, family: 0, other: 0, total: 2 },
    { company: 'Lewis Industries', eeOnly: 3, eePlusSP: 0, eePlusCH: 0, family: 0, other: 0, total: 3 },
    { company: 'Stark Enterprises', eeOnly: 12, eePlusSP: 8, eePlusCH: 5, family: 7, other: 2, total: 34 },
    { company: 'Wayne Technologies', eeOnly: 9, eePlusSP: 6, eePlusCH: 3, family: 5, other: 1, total: 24 },
    { company: 'Acme Corporation', eeOnly: 15, eePlusSP: 10, eePlusCH: 7, family: 12, other: 0, total: 44 },
    { company: 'Globex Industries', eeOnly: 8, eePlusSP: 4, eePlusCH: 2, family: 3, other: 0, total: 17 },
    { company: 'Initech Solutions', eeOnly: 11, eePlusSP: 7, eePlusCH: 4, family: 6, other: 1, total: 29 }
  ],
  planSelection: [
    { name: 'Silver 203', percentage: 31, color: '#3b82f6' },
    { name: 'Gold 202', percentage: 26.1, color: '#06b6d4' },
    { name: 'Silver 201 HSA', percentage: 13.6, color: '#ec4899' },
    { name: 'Anthem Silver Pathway HMO 6000', percentage: 11.8, color: '#f97316' },
    { name: 'Ambetter Health Solutions Gold 3000', percentage: 5.2, color: '#f59e0b' },
    { name: 'Ambetter Health Solutions Silver 4500', percentage: 4.1, color: '#84cc16' },
    { name: 'Gold 201 HSA', percentage: 3.1, color: '#4f46e5' },
    { name: 'Anthem Silver Pathway HMO 5000', percentage: 2.8, color: '#8b5cf6' },
    { name: 'Others', percentage: 2.3, color: '#f97316' }
  ],
  benAdminReport: [
    { id: '40...', relationship: 'subscriber', m: 'B...', mid: 'Da...', mem: 'J...', gender: 'Male', fullName: '8209...', totalPremium: 353.71, memberPremium: 353.71, issuer: 0, selectedPlan: 'Gold 202', effectiveDate: 'May 1, 2025', appType: 'Ap...', t: 7, s: 'Su...', en: 'Oc...', c: 'Lo...', name: 'EE...', member: 'C', email: 'D...', ein: 'B...' },
    { id: '31...', relationship: 'subscriber', m: 'B...', mid: 'Kri...', mem: 'M...', gender: 'Male', fullName: '576 Vi...', totalPremium: 502.42, memberPremium: 502.42, issuer: 3, selectedPlan: 'Silver 2...', effectiveDate: 'May 1, 2025', appType: 'Ap...', t: 'b...', s: 'Su...', en: 'Fr...', c: 'Lo...', name: 'EE...', member: 'L', email: 'K...', ein: 'B...' },
    { id: '40...', relationship: 'subscriber', m: 'P...', mid: 'Be...', mem: 'A...', gender: 'Female', fullName: '1420...', totalPremium: 788.05, memberPremium: 788.05, issuer: 5, selectedPlan: 'Silver 2...', effectiveDate: 'May 1, 2025', appType: 'Ap...', t: '3...', s: 'Su...', en: 'Fr...', c: 'Lo...', name: 'EE...', member: 'null', email: 'B...', ein: 'P...' },
    { id: '40...', relationship: 'subscriber', m: 'S...', mid: 'Ali...', mem: 'J...', gender: 'Female', fullName: '65 Jea...', totalPremium: 501.89, memberPremium: 501.89, issuer: 3, selectedPlan: 'Silver 2...', effectiveDate: 'May 1, 2025', appType: 'Ap...', t: 'c...', s: 'Su...', en: 'Fr...', c: 'Lo...', name: 'EE...', member: 'null', email: 'Al...', ein: 'St...' },
    { id: '40...', relationship: 'subscriber', m: 'B...', mid: 'De...', mem: 'A...', gender: 'Female', fullName: '8692...', totalPremium: 911.94, memberPremium: 911.94, issuer: 6, selectedPlan: 'Gold 202', effectiveDate: 'May 1, 2025', appType: 'Ap...', t: '1...', s: 'Su...', en: 'Fr...', c: 'Lo...', name: 'EE...', member: 'null', email: 'D...', ein: 'B...' },
    { id: '40...', relationship: 'subscriber', m: 'H...', mid: 'Ch...', mem: 'F...', gender: 'Male', fullName: '219 Ba...', totalPremium: 917.3299, memberPremium: 473.37, issuer: 2, selectedPlan: 'Anthe...', effectiveDate: 'May 1, 2025', appType: 'Ap...', t: 'd...', s: 'Su...', en: 'AR...', c: 'Je...', name: 'EE...', member: 'null', email: 'C...', ein: 'Hall' }
  ]
};

// TPAs for filtering
const tpaOptions = [
  { id: '1', name: 'Transperra Choice' },
  { id: '2', name: 'BenefitLink' },
  { id: '3', name: 'AdminPlus' }
];

// Brokerages for filtering
const brokerageOptions = [
  { id: '1', name: 'Global Benefits' },
  { id: '2', name: 'PremiumCore' },
  { id: '3', name: 'Midwest Insurance Group' }
];

// Agents for filtering
const agentOptions = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Robert Williams' }
];

// Companies for filtering
const companyOptions = enrollmentData.enrollmentSummary.map((row, index) => ({
  id: (index + 1).toString(),
  name: row.company
}));

// Update component interfaces
interface FilterDropdownProps {
  label: string;
  value?: string;
  options?: Array<{id: string, name: string}>;
  onChange?: (value: string) => void;
  showOptionsCount?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ 
  label, 
  value = "", 
  options = [],
  onChange = () => {},
  showOptionsCount = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label} {value && showOptionsCount && <span className="font-medium ml-1">({value})</span>}
        <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-500" aria-hidden="true" />
      </button>
      
      {isOpen && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto" role="menu">
            {options.map((option) => (
              <li 
                key={option.id}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
              >
                {option.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface PieChartProps {
  data: PlanSelectionItem[];
}

// Pie chart component
const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const totalPercentage = data.reduce((acc: number, item: PlanSelectionItem) => acc + item.percentage, 0);
  let startAngle = 0;

  return (
    <div className="relative h-64 w-64 mx-auto">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {data.map((item, index) => {
          // Calculate the angles for this slice
          const angle = (item.percentage / totalPercentage) * 360;
          const endAngle = startAngle + angle;
          
          // Convert to radians
          const startAngleRad = (startAngle - 90) * (Math.PI / 180);
          const endAngleRad = (endAngle - 90) * (Math.PI / 180);
          
          // Calculate the points on the circle
          const x1 = 50 + 50 * Math.cos(startAngleRad);
          const y1 = 50 + 50 * Math.sin(startAngleRad);
          const x2 = 50 + 50 * Math.cos(endAngleRad);
          const y2 = 50 + 50 * Math.sin(endAngleRad);
          
          // Create the arc path
          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          
          // Update the startAngle for the next slice
          startAngle = endAngle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="#fff"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
    </div>
  );
};

interface LegendProps {
  data: PlanSelectionItem[];
}

// Legend component
const Legend: React.FC<LegendProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-2 mt-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: item.color }}
          ></div>
          <span className="text-xs text-gray-700">{item.name} ({item.percentage}%)</span>
        </div>
      ))}
    </div>
  );
};

const Enrollments: React.FC = () => {
  // State for filters
  const [selectedTpa, setSelectedTpa] = useState<string>('1');
  const [selectedBrokerage, setSelectedBrokerage] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedPlanYear, setSelectedPlanYear] = useState<string>('1');
  const [selectedEnrollmentStatus, setSelectedEnrollmentStatus] = useState<string>('1');
  const [selectedRecentPlan, setSelectedRecentPlan] = useState<string>('1');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [reportPage, setReportPage] = useState(1);
  const reportItemsPerPage = 6;
  
  // Filter the enrollment summary based on selected company
  const filteredEnrollmentSummary = selectedCompany 
    ? enrollmentData.enrollmentSummary.filter((row, index) => (index + 1).toString() === selectedCompany)
    : enrollmentData.enrollmentSummary;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredEnrollmentSummary.length / itemsPerPage);
  const paginatedEnrollmentSummary = filteredEnrollmentSummary.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calculate total employees from filtered data
  const calculatedTotalEmployees = filteredEnrollmentSummary.reduce((acc, row) => acc + row.total, 0);
  
  // Paginate the BenAdmin report
  const totalReportPages = Math.ceil(enrollmentData.benAdminReport.length / reportItemsPerPage);
  const paginatedReport = enrollmentData.benAdminReport.slice(
    (reportPage - 1) * reportItemsPerPage,
    reportPage * reportItemsPerPage
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary-800">Enrollment Dashboard</h1>
        <div className="flex items-center">
          <span className="text-lg text-secondary-800 mr-3">Enrolled Employees:</span>
          <span className="text-xl font-semibold bg-secondary-800 text-white px-4 py-2 rounded">
            {selectedCompany ? calculatedTotalEmployees : enrollmentData.totalEnrolled}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1">
          <FilterDropdown 
            label="TPA: Transperra Choice" 
            value={selectedTpa} 
            options={tpaOptions}
            onChange={setSelectedTpa}
            showOptionsCount={true}
          />
        </div>
        <div className="col-span-1 lg:col-start-3">
          <FilterDropdown 
            label="Brokerage" 
            value={selectedBrokerage}
            options={brokerageOptions}
            onChange={setSelectedBrokerage}
          />
        </div>
        <div className="col-span-1 lg:col-start-4">
          <FilterDropdown 
            label="Agent" 
            value={selectedAgent}
            options={agentOptions}
            onChange={setSelectedAgent}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1">
          <FilterDropdown 
            label="Company" 
            value={selectedCompany}
            options={companyOptions}
            onChange={setSelectedCompany}
          />
        </div>
        <div className="col-span-1">
          <FilterDropdown 
            label="Plan Year: 2025" 
            value={selectedPlanYear} 
            showOptionsCount={true}
          />
        </div>
        <div className="col-span-1">
          <FilterDropdown 
            label="Enrollment Status" 
            value={selectedEnrollmentStatus}
            showOptionsCount={true}
          />
        </div>
        <div className="col-span-1">
          <FilterDropdown 
            label="Most Recent Plan" 
            value={selectedRecentPlan}
            showOptionsCount={true}
          />
        </div>
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Enrollment Summary */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-secondary-800 text-white">
            <h2 className="text-lg font-medium">Enrollment Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EE Only
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EE + SP
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EE + CH
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FAMILY
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Other
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEnrollmentSummary.map((row, index) => (
                  <tr 
                    key={index} 
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    onClick={() => setSelectedCompany((index + 1).toString())}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="px-4 py-2 text-sm text-gray-900">{row.company}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.eeOnly}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.eePlusSP}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.eePlusCH}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.family}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.other}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button 
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredEnrollmentSummary.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredEnrollmentSummary.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Show page numbers */}
                  {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                          ${currentPage === pageNum 
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Selection Pie Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 bg-secondary-800 text-white">
            <h2 className="text-lg font-medium">Plan Selection</h2>
          </div>
          <div className="p-4 flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <PieChart data={enrollmentData.planSelection} />
            </div>
            <div className="md:w-1/2 mt-4 md:mt-0">
              <Legend data={enrollmentData.planSelection} />
            </div>
          </div>
        </div>
      </div>

      {/* BenAdmin Extract Report */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-secondary-800 text-white flex justify-between items-center">
          <h2 className="text-lg font-medium">BenAdmin Extract Report (export to see all)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relationship
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  M
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MID
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mem
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Prem
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Prem
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  I
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selected Plan
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReport.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'}>
                  <td className="px-3 py-2 text-xs text-gray-900 truncate max-w-[80px]">{row.id}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{row.relationship}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{row.m}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{row.mid}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{row.mem}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{row.gender}</td>
                  <td className="px-3 py-2 text-xs text-gray-900 truncate max-w-[100px]">{row.fullName}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">${row.totalPremium.toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">${row.memberPremium.toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{row.issuer}</td>
                  <td className="px-3 py-2 text-xs text-gray-900 truncate max-w-[120px]">{row.selectedPlan}</td>
                  <td className="px-3 py-2 text-xs text-gray-900">{row.effectiveDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button 
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setReportPage(prev => Math.max(prev - 1, 1))}
              disabled={reportPage === 1}
            >
              Previous
            </button>
            <button 
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setReportPage(prev => Math.min(prev + 1, totalReportPages))}
              disabled={reportPage === totalReportPages}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(reportPage - 1) * reportItemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(reportPage * reportItemsPerPage, enrollmentData.benAdminReport.length)}
                </span>{' '}
                of <span className="font-medium">{enrollmentData.benAdminReport.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => setReportPage(prev => Math.max(prev - 1, 1))}
                  disabled={reportPage === 1}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page indicator */}
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {reportPage} of {totalReportPages}
                </span>
                
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => setReportPage(prev => Math.min(prev + 1, totalReportPages))}
                  disabled={reportPage === totalReportPages}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons for filtering */}
      <div className="flex justify-end space-x-4">
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-800 hover:bg-secondary-700"
          onClick={() => {
            setSelectedCompany('');
            setSelectedBrokerage('');
            setSelectedAgent('');
            setCurrentPage(1);
            setReportPage(1);
          }}
        >
          Reset Filters
        </button>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          onClick={() => alert('Export functionality would generate a CSV/Excel file in a real implementation')}
        >
          Export Data
        </button>
      </div>
    </div>
  );
};

export default Enrollments; 