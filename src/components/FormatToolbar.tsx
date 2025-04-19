import React, { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Table, Check, Image } from 'lucide-react';
import IconButton from './ui/IconButton';

interface FormatToolbarProps {
  onFormatClick: (formatType: string) => void;
  activeFormats: string[];
}

const FormatToolbar: React.FC<FormatToolbarProps> = ({ onFormatClick, activeFormats }) => {
  const [isSticky, setIsSticky] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const formatOptions = [
    { id: 'bold', icon: <Bold size={18} />, label: 'Bold' },
    { id: 'italic', icon: <Italic size={18} />, label: 'Italic' },
    { id: 'underline', icon: <Underline size={18} />, label: 'Underline' },
    { id: 'bulletList', icon: <List size={18} />, label: 'Bullet List' },
    { id: 'orderedList', icon: <ListOrdered size={18} />, label: 'Numbered List' },
    { id: 'table', icon: <Table size={18} />, label: 'Insert Table' },
    { id: 'layoutTable', icon: <TableRows size={18} />, label: 'Layout Table' },
    { id: 'checklist', icon: <Check size={18} />, label: 'Checklist' },
    { id: 'image', icon: <Image size={18} />, label: 'Insert Image' },
  ];

  return (
    <div 
      className={`flex items-center border rounded-md p-1 bg-white z-10 transition-all duration-300 mb-2 gap-1 ${
        isSticky ? 'sticky top-0 shadow-md animate-slide-in' : ''
      }`}
    >
      {formatOptions.map((option) => (
        <IconButton
          key={option.id}
          icon={option.icon}
          label={option.label}
          active={activeFormats.includes(option.id)}
          onClick={() => onFormatClick(option.id)}
        />
      ))}
    </div>
  );
};

export default FormatToolbar;
