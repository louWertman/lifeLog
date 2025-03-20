import React, { useState } from 'react';

interface ViewEntryProps {
  id: number;
  title: string;
  content: string;
  date: string;
  onSave: (id: number, title: string, content: string, date: string) => void;
}

const ViewEntry: React.FC<ViewEntryProps> = ({ id, title, content, date, onSave }) => {
  const [entryTitle, setEntryTitle] = useState(title);
  const [entryContent, setEntryContent] = useState(content);
  const [entryDate, setEntryDate] = useState(date);

  const handleSave = () => {
    onSave(id, entryTitle, entryContent, entryDate);
  };
// page for viewing an entry
  return (
    <div>
      <h1>View Entry</h1>
      <h2>{entryTitle}</h2>
      <small>{entryDate}</small>
      <p>{entryContent}</p>
    </div>
  );
};

export default ViewEntry;
