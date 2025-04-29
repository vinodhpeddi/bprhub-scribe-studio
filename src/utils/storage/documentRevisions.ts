
import { v4 as uuidv4 } from 'uuid';
import { Revision } from '../commentTypes';
import { getCurrentUser } from '../collaborationService';
import { MAX_REVISION_CONTENT_SIZE, MAX_REVISIONS_PER_DOCUMENT } from './documentStorageUtils';
import { saveRevisionContent } from './revisionStorageManager';
import { handleRevisionSaveError } from './revisionErrorHandler';
import { htmlToModel } from '@/utils/editor/model/htmlToModel';
import { modelToHtml } from '@/utils/editor/model/modelToHtml';
import { 
  createDocumentVersion, 
  DocumentVersion, 
  compareVersions, 
  VersionDiff 
} from './documentVersioning';

// Key for storing the enhanced version data separate from simple revisions
const getVersionStorageKey = (documentId: string) => `doc_versions_${documentId}`;

export function getDocumentRevisions(documentId: string): Revision[] {
  try {
    const storedRevisions = localStorage.getItem(`revisions_${documentId}`);
    return storedRevisions ? JSON.parse(storedRevisions) : [];
  } catch (error) {
    console.error('Error getting document revisions:', error);
    return [];
  }
}

export function getDocumentVersions(documentId: string): DocumentVersion[] {
  try {
    const storedVersions = localStorage.getItem(getVersionStorageKey(documentId));
    return storedVersions ? JSON.parse(storedVersions) : [];
  } catch (error) {
    console.error('Error getting document versions:', error);
    return [];
  }
}

export function compareDocumentVersions(documentId: string, version1Id: string, version2Id: string): VersionDiff | null {
  try {
    const versions = getDocumentVersions(documentId);
    const v1 = versions.find(v => v.id === version1Id);
    const v2 = versions.find(v => v.id === version2Id);
    
    if (v1 && v2) {
      return compareVersions(v1, v2);
    }
    
    return null;
  } catch (error) {
    console.error('Error comparing document versions:', error);
    return null;
  }
}

export function saveRevision(
  documentId: string, 
  content: string, 
  title: string, 
  isAuto: boolean = false, 
  label?: string, 
  description?: string
): Revision {
  try {
    const user = getCurrentUser();
    const revisions = getDocumentRevisions(documentId);
    
    // Create standard revision for backward compatibility
    let truncatedContent = content;
    if (content.length > MAX_REVISION_CONTENT_SIZE) {
      console.warn(`Revision content exceeds max size (${content.length} > ${MAX_REVISION_CONTENT_SIZE}), truncating`);
      truncatedContent = content.substring(0, MAX_REVISION_CONTENT_SIZE) + 
        '<p><em>Content truncated due to storage limitations</em></p>';
    }
    
    // Create new revision
    const newRevision: Revision = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      content: truncatedContent,
      title,
      authorId: user.id,
      authorName: user.name,
      isAuto,
      label,
      description
    };
    
    // Limit the number of revisions to prevent storage overflow
    revisions.push(newRevision);
    const limitedRevisions = revisions.length > MAX_REVISIONS_PER_DOCUMENT ? 
      revisions.slice(revisions.length - MAX_REVISIONS_PER_DOCUMENT) : 
      revisions;
    
    // Save the standard revision
    const savedRevision = saveRevisionContent(documentId, limitedRevisions, newRevision);
    
    // Also save as a document version with model data for better comparison
    try {
      const version = createDocumentVersion(
        content, 
        title, 
        user.id,
        user.name,
        isAuto, 
        label, 
        description
      );
      
      // Save version to storage
      const versions = getDocumentVersions(documentId);
      versions.push(version);
      
      // Limit the number of versions stored
      const limitedVersions = versions.length > MAX_REVISIONS_PER_DOCUMENT ?
        versions.slice(versions.length - MAX_REVISIONS_PER_DOCUMENT) :
        versions;
      
      // Try to save versions
      localStorage.setItem(getVersionStorageKey(documentId), JSON.stringify(limitedVersions));
    } catch (error) {
      console.error('Error saving document version:', error);
      // Continue with standard revision even if enhanced version fails
    }
    
    return savedRevision;
  } catch (error) {
    console.error('Error saving revision:', error);
    return handleRevisionSaveError(documentId, title);
  }
}

export function updateRevisionLabel(documentId: string, revisionId: string, label: string, description?: string): void {
  try {
    const revisions = getDocumentRevisions(documentId);
    const index = revisions.findIndex(rev => rev.id === revisionId);
    
    if (index >= 0) {
      revisions[index] = {
        ...revisions[index],
        label,
        description: description || revisions[index].description
      };
      
      localStorage.setItem(`revisions_${documentId}`, JSON.stringify(revisions));
      
      // Also update in versions if it exists
      try {
        const versions = getDocumentVersions(documentId);
        const versionIndex = versions.findIndex(v => v.id === revisionId);
        
        if (versionIndex >= 0) {
          versions[versionIndex] = {
            ...versions[versionIndex],
            label,
            description: description || versions[versionIndex].description
          };
          
          localStorage.setItem(getVersionStorageKey(documentId), JSON.stringify(versions));
        }
      } catch (e) {
        console.error('Error updating version label:', e);
      }
    }
  } catch (error) {
    console.error('Error updating revision label:', error);
    throw error;
  }
}

export function deleteDocumentRevisions(documentId: string): void {
  try {
    localStorage.removeItem(`revisions_${documentId}`);
    localStorage.removeItem(getVersionStorageKey(documentId));
  } catch (error) {
    console.error('Error deleting document revisions:', error);
    throw error;
  }
}

export function getRevisionById(documentId: string, revisionId: string): Revision | null {
  try {
    const revisions = getDocumentRevisions(documentId);
    return revisions.find(rev => rev.id === revisionId) || null;
  } catch (error) {
    console.error('Error getting revision:', error);
    return null;
  }
}

export function getVersionById(documentId: string, versionId: string): DocumentVersion | null {
  try {
    const versions = getDocumentVersions(documentId);
    return versions.find(v => v.id === versionId) || null;
  } catch (error) {
    console.error('Error getting version:', error);
    return null;
  }
}
