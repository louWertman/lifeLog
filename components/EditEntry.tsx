'use client';

import React, { useEffect, useState } from 'react';
import { Habit } from '../app/lib/entity';
import '../app/css/entry.module.css';
import Habits from './habits';

//TODO [ ] Investigate Blank Content in Entry

interface EditEntryProps {
  date: string;
  content: string;
  habits: string[];
  mood: string;
  onSave: (content: string, date: string, habits: string[], mood: string) => void;
}

let currentDate = new Date().toISOString().split('T')[0];

const EditEntry: React.FC<EditEntryProps> = ({ mood, habits, content, date, onSave }) => {
  const [entryContent, setEntryContent] = useState(content);
  const [entryDate, setEntryDate] = useState(date);
  const [entryMood, setEntryMood] = useState(mood);
  const [entryHabits, setEntryHabits] = useState<string[]>(habits);

  const handleSave = () => {
    setEntryDate(currentDate)
    onSave(entryContent, entryDate, entryHabits, entryMood);
  };

  return (
    <div>

      <div className="entry-container">
      <h1>Edit Entry for {entryDate}</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          
          <div style={{ flex: '3' }}>
            <label htmlFor="body">Body Entry:</label>
            <textarea
              value={entryContent}
              onChange={(e) => setEntryContent(e.target.value)}
              rows={10}
              className="entry-body"
            />
          </div>

            <div style={{ flex: '1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="habits">Habits:</label>
              <Habits
              selectedHabits={entryHabits}
              setSelectedHabits={setEntryHabits}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <label htmlFor="mood">Mood:</label>
              <input
              type="text"
              id="mood"
              value={entryMood}
              onChange={(e) => setEntryMood(e.target.value)}
              />
            </div>
            </div>
        </div>

        <button className="entry-container button" style={{ marginTop: '20px' }} onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default EditEntry;
