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
      <label>Title:</label>
      <input
        type="text"
        value={entryTitle}
        onChange={(e) => setEntryTitle(e.target.value)}
      />
      <br />
      <label>Date:</label>
      <input
        type="datetime-local"
        value={entryDate}
        onChange={(e) => setEntryDate(e.target.value)}
      />
      <br />
      <textarea
        value={entryContent}
        onChange={(e) => setEntryContent(e.target.value)}
      />
      <br />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditEntry;
