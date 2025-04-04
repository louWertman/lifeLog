'use client';

import React, { useEffect, useState } from 'react';
import { Habit } from '../app/lib/entity'; 
import Habits from './habits';

interface EditEntryProps {
  date: string;
  content: string;
  habits: string[];
  mood: string;
  onSave: (content: string, date: string, habits: string[], mood: string) => void;
}

const EditEntry: React.FC<EditEntryProps> = ({ mood, habits, content, date, onSave }) => {
  const [entryContent, setEntryContent] = useState(content);
  const [entryDate, setEntryDate] = useState(date);
  const [entryMood, setEntryMood] = useState(mood);
  const [entryHabits, setEntryHabits] = useState<string[]>(habits);

  const currentDate = new Date().toString().split('T')[0];
  const handleSave = () => {
    setEntryDate(currentDate);
    onSave(entryContent, entryDate, entryHabits, entryMood);
  };


  return (
    <div>
      <h1>Edit Entry</h1>
      <h2>
        {currentDate}
      </h2>
      
      <textarea
        value={entryContent}
        onChange={(e) => setEntryContent(e.target.value)}
      />
      <label htmlFor="habits">Habits:</label>
      <Habits
        selectedHabits={entryHabits}
        setSelectedHabits={setEntryHabits}
      />
      <label htmlFor="mood">Mood:</label>
      <input
        type="text"
        id="mood"
        value={entryMood}
        onChange={(e) => setEntryMood(e.target.value)}
      />

      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditEntry;
