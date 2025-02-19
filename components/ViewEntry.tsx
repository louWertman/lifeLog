import React, { useState } from 'react';

interface EditEntryProps {
  id: number;
  title: string;
  content: string;
  date: string;
  onSave: (id: number, title: string, content: string, date: string) => void;
}

const EditEntry: React.FC<EditEntryProps> = ({ id, title, content, date, onSave }) => {
  const [entryTitle, setEntryTitle] = useState(title);
  const [entryContent, setEntryContent] = useState(content);
  const [entryDate, setEntryDate] = useState(date);

  const handleSave = () => {
    onSave(id, entryTitle, entryContent, entryDate);
  };

  return (
    <div>
      <h1>Edit Entry</h1>
      <h2>{entryTitle}</h2>
      <small>{entryDate}</small>
      <p>{entryContent}</p>
    </div>
  );
};

export default EditEntry;
