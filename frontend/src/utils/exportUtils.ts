/**
 * Export utility functions for Kyndly ICHRA Portal
 */
import * as XLSX from 'xlsx';

// Quote type definition for type safety
export interface Quote {
  submissionId?: string;
  companyName?: string;
  transperraRep?: string;
  ichraEffectiveDate?: string;
  pepm?: string;
  status?: string;
  brokerName?: string;
  employerName?: string;
  brokerId?: string;
  employerId?: string;
  s3Key?: string;
  brokerEmail?: string;
  tpaId?: string;
  targetDeductible?: string;
  targetHSA?: string;
  isGLI?: boolean;
  priorityLevel?: string;
  contactType?: string;
  submissionDate?: string | Date;
  additionalNotes?: string;
  [key: string]: any; // Allow additional properties
}

// Field definition for exports
interface ExportField {
  header: string;
  value: any;
  width?: number; // Width for Excel columns
}

/**
 * Convert quote data to CSV format
 * @param quote The quote data to convert
 * @returns CSV string
 */
export const quoteToCSV = (quote: Quote): string => {
  if (!quote) return '';

  // Define the fields we want to include in the CSV
  const fields = getQuoteFields(quote);
  
  // Create header row
  const headers = fields.map(field => escapeCSV(field.header)).join(',');
  
  // Create data row
  const data = fields.map(field => {
    // Convert to string and ensure it's not null/undefined
    const valueStr = formatValueAsString(field.value);
    return escapeCSV(valueStr);
  }).join(',');
  
  return headers + '\n' + data;
};

/**
 * Format a value as string for export
 */
const formatValueAsString = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  // Format dates consistently
  if (value instanceof Date) {
    return formatDate(value);
  }
  
  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Handle arrays and objects
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  
  return String(value);
};

/**
 * Format a date consistently for export
 */
const formatDate = (date: Date): string => {
  try {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return date.toISOString().split('T')[0]; // Fallback to YYYY-MM-DD
  }
};

/**
 * Get standardized quote fields for export
 */
const getQuoteFields = (quote: Quote): ExportField[] => [
  { header: 'Submission ID', value: quote.submissionId || '', width: 15 },
  { header: 'Company Name', value: quote.companyName || '', width: 25 },
  { header: 'Transperra Rep', value: quote.transperraRep || '', width: 20 },
  { header: 'ICHRA Effective Date', value: quote.ichraEffectiveDate || '', width: 20 },
  { header: 'PEPM', value: quote.pepm || '', width: 10 },
  { header: 'Status', value: quote.status || '', width: 15 },
  { header: 'Broker Name', value: quote.brokerName || '', width: 20 },
  { header: 'Broker ID', value: quote.brokerId || '', width: 15 },
  { header: 'Broker Email', value: quote.brokerEmail || '', width: 25 },
  { header: 'Employer Name', value: quote.employerName || '', width: 25 },
  { header: 'Employer ID', value: quote.employerId || '', width: 15 },
  { header: 'TPA ID', value: quote.tpaId || '', width: 15 },
  { header: 'Target Deductible', value: quote.targetDeductible || '', width: 15 },
  { header: 'Target HSA', value: quote.targetHSA || '', width: 15 },
  { header: 'Is GLI', value: quote.isGLI ? 'Yes' : 'No', width: 10 },
  { header: 'Priority Level', value: quote.priorityLevel || '', width: 15 },
  { header: 'Contact Type', value: quote.contactType || '', width: 15 },
  { 
    header: 'Submission Date', 
    value: quote.submissionDate 
      ? (quote.submissionDate instanceof Date 
          ? quote.submissionDate 
          : new Date(quote.submissionDate)) 
      : '', 
    width: 20 
  },
  { header: 'Additional Notes', value: quote.additionalNotes || '', width: 40 }
];

/**
 * Escape special characters for CSV format
 * @param value The value to escape
 * @returns Escaped value
 */
const escapeCSV = (value: string): string => {
  // If the value contains a comma, quote, or newline, wrap it in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Replace any quotes with double quotes for escaping
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Download data as a file
 * @param data The data to download
 * @param filename The filename to use
 * @param mimeType The MIME type of the file
 */
export const downloadFile = (data: string | Blob, filename: string, mimeType: string = 'text/csv'): void => {
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Error downloading file. Please try again.');
  }
};

/**
 * Export quote to CSV and trigger download
 * @param quote The quote data to export
 * @param filename Optional filename (defaults to quote-{submissionId}.csv)
 */
export const exportQuoteToCSV = (quote: Quote, filename?: string): void => {
  try {
    if (!quote) {
      console.error('Cannot export empty quote data');
      return;
    }
    
    const csvData = quoteToCSV(quote);
    const downloadName = filename || `quote-${quote.submissionId || 'export'}.csv`;
    downloadFile(csvData, downloadName);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Error exporting to CSV. Please try again.');
  }
};

/**
 * Export quote to Excel and trigger download
 * @param quote The quote data to export
 * @param filename Optional filename (defaults to quote-{submissionId}.xlsx)
 */
export const exportQuoteToExcel = (quote: Quote, filename?: string): void => {
  try {
    if (!quote) {
      console.error('Cannot export empty quote data');
      return;
    }
    
    // Get the field definitions
    const fields = getQuoteFields(quote);
    
    // Create worksheet data as an array of arrays
    const wsData = [
      // Header row
      fields.map(field => field.header),
      // Data row with formatted values
      fields.map(field => formatValueForExcel(field.value))
    ];
    
    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidth = fields.map(field => ({ wch: field.width || 15 }));
    ws['!cols'] = colWidth;
    
    // Apply styling to the header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cell]) continue;
      
      // Make header bold
      ws[cell].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' }
      };
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quote');
    
    // Generate the Excel file and download it
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const downloadName = filename || `quote-${quote.submissionId || 'export'}.xlsx`;
    downloadFile(blob, downloadName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel. Please try again.');
  }
};

/**
 * Format a value specifically for Excel export
 */
const formatValueForExcel = (value: any): any => {
  if (value === null || value === undefined) return '';
  
  // Preserve date objects for Excel to format them properly
  if (value instanceof Date) {
    return value;
  }
  
  // Otherwise use our standard formatting
  return formatValueAsString(value);
}; 