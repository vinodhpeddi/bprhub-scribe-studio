
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePen, FileText, Plus } from 'lucide-react';
import { templates, UserDocument, getAllDocuments } from '@/utils/editorUtils';
import { useNavigate } from 'react-router-dom';

export const DocumentList = () => {
  const navigate = useNavigate();
  const documents = getAllDocuments();
  const sortedDocuments = [...documents].sort((a, b) => 
    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  ).slice(0, 6); // Show only the 6 most recent documents

  const handleCreateNew = () => {
    navigate('/editor');
  };

  const handleOpenDocument = (doc: UserDocument) => {
    navigate('/editor', { state: { document: doc } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">BPRHub Scribe Studio</h1>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDocuments.map((doc) => (
          <Card 
            key={doc.id}
            className="cursor-pointer hover:border-editor-primary transition-colors"
            onClick={() => handleOpenDocument(doc)}
          >
            <CardHeader className="pb-2">
              {doc.isDraft ? (
                <FilePen className="h-5 w-5 text-amber-500 mb-2" />
              ) : (
                <FileText className="h-5 w-5 text-editor-primary mb-2" />
              )}
              <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
              <CardDescription>
                Last modified: {new Date(doc.lastModified).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {doc.isDraft ? 'Draft' : 'Finalized'} • {templates.find(t => t.id === doc.template)?.name || 'Custom Template'}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-4">Create your first document to get started</p>
          <Button onClick={handleCreateNew}>
            Create New Document
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
