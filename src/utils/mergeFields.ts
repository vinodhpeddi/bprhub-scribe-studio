
export interface MergeField {
  key: string;
  label: string;
  sampleValue: string;
}

export const availableMergeFields: MergeField[] = [
  { key: 'DocumentNumber', label: 'Document Number', sampleValue: 'SOP-2025-001' },
  { key: 'RevisionNumber', label: 'Revision Number', sampleValue: 'Rev. 1.0' },
  { key: 'EffectiveDate', label: 'Effective Date', sampleValue: new Date().toLocaleDateString() },
  { key: 'Department', label: 'Department', sampleValue: 'Manufacturing' },
  { key: 'Approver', label: 'Approver Name', sampleValue: 'John Smith' },
  { key: 'ReviewDate', label: 'Review Date', sampleValue: new Date().toLocaleDateString() },
  { key: 'EquipmentID', label: 'Equipment ID', sampleValue: 'EQ-001' },
  { key: 'SafetyWarning', label: 'Safety Warning', sampleValue: 'Wear appropriate PPE' },
  { key: 'QualityStandard', label: 'Quality Standard', sampleValue: 'ISO 9001:2015' }
];

export const replaceMergeFields = (content: string, useRealData: boolean = false): string => {
  return availableMergeFields.reduce((text, field) => {
    const pattern = new RegExp(`{{${field.key}}}`, 'g');
    return text.replace(pattern, field.sampleValue);
  }, content);
};
