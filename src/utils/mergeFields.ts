
export interface MergeField {
  key: string;
  label: string;
  sampleValue: string;
}

export const availableMergeFields: MergeField[] = [
  { key: 'CustomerName', label: 'Customer Name', sampleValue: 'John Doe' },
  { key: 'InvoiceDate', label: 'Invoice Date', sampleValue: new Date().toLocaleDateString() },
  { key: 'CompanyName', label: 'Company Name', sampleValue: 'ACME Corp' },
  { key: 'DocumentNumber', label: 'Document Number', sampleValue: 'DOC-2025-001' }
];

export const replaceMergeFields = (content: string, useRealData: boolean = false): string => {
  return availableMergeFields.reduce((text, field) => {
    const pattern = new RegExp(`{{${field.key}}}`, 'g');
    return text.replace(pattern, field.sampleValue);
  }, content);
};
