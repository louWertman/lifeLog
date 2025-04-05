import React, { useState } from 'react';
import '../app/css/entry.module.css';

interface EditEntryProps {
  date: string;
  content: string;
  habits: string;
  mood: string;
  onSave: (content: string, date: string, habits: string, mood: string) => void;
}

const EditEntry: React.FC<EditEntryProps> = ({ mood, habits, content, date, onSave }) => {
  const [entryContent, setEntryContent] = useState(content);
  const [entryDate, setEntryDate] = useState(date);
  const [entryMood, setEntryMood] = useState(mood);
  const [entryHabits, setEntryHabits] = useState(habits);

  const handleSave = () => {
    onSave(entryContent, entryDate, entryHabits, entryMood);
  };

  return (
    <div>
      <h1>Edit Entry</h1>
      <h1>{entryDate}</h1>
      <p>{entryContent}</p>
    </div>
  );
};

export default EditEntry;
