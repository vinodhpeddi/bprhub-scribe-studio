
import { UserDocument } from './documentTypes';

export function saveDocument(document: UserDocument): void {
  try {
    const storedDocs = localStorage.getItem('userDocuments');
    const docs: UserDocument[] = storedDocs ? JSON.parse(storedDocs) : [];
    
    const existingIndex = docs.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      docs[existingIndex] = document;
    } else {
      docs.push(document);
    }
    
    localStorage.setItem('userDocuments', JSON.stringify(docs));
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

export function getAllDocuments(): UserDocument[] {
  try {
    const storedDocs = localStorage.getItem('userDocuments');
    return storedDocs ? JSON.parse(storedDocs) : [];
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
}

export function getDocumentById(id: string): UserDocument | null {
  try {
    const docs = getAllDocuments();
    return docs.find(doc => doc.id === id) || null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

export function deleteDocument(id: string): void {
  try {
    const docs = getAllDocuments();
    const filteredDocs = docs.filter(doc => doc.id !== id);
    localStorage.setItem('userDocuments', JSON.stringify(filteredDocs));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export function createNewDraft(template: import('./documentTypes').DocumentTemplate, title: string = 'Untitled Document'): UserDocument {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    title,
    content: template.initialContent,
    template: template.id,
    lastModified: now,
    createdAt: now,
    isDraft: true
  };
}

export function finalizeDraft(document: UserDocument): UserDocument {
  return {
    ...document,
    isDraft: false,
    lastModified: new Date().toISOString()
  };
}
