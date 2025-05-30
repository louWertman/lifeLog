'use client';

/*
Edit Entry compoenent
*/

import React, { useEffect, useState } from 'react';
import { Habit } from '../app/lib/entity';
import '../app/css/entry.module.css';
import Habits from '../components/habits';
import { FileSystem } from '../app/lib/dataManagement';

interface EditEntryProps {
  date: string;
  content: string;
  habits: string[];
  mood: string;
  onSave: (content: string, date: string, habits: string[], mood: string) => void;
}

const EditEntry: React.FC<EditEntryProps> = ({ mood, habits, content, date, onSave }) => {
  let currentDate = date ?? new Date().toLocaleString('en-ET').split(',')[0];
  date = currentDate;

  const [entryContent, setEntryContent] = useState(content);
  const [entryDate, setEntryDate] = useState(date);
  const [entryMood, setEntryMood] = useState(mood);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [entryHabits, setEntryHabits] = useState<string[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);


//Santize the entry content and saves
  const handleSave = () => {
    setEntryDate(date)
    let sanEntryContent = entryContent.replace(/\n/g, '\\n');
    onSave(sanEntryContent, entryDate, entryHabits, entryMood);
    const savedTime = new Date().toLocaleString('en-ET').split('.')[0];
    setLastSaved(savedTime);
  };

  useEffect(() => {
    setEntryDate(date);
    setEntryHabits([]);
    const getEntry = async () => {
      const fs = new FileSystem();
      const entryFetch = await fs.fetchEntry(date);
      if (entryFetch) {
        setEntryContent(entryFetch.textEntry.replace(/\\n/g, '\n'));
        setEntryMood(entryFetch.mood);
        setEntryHabits(entryFetch.habits.map((habit: Habit) => habit.name));
      }
    };

    if (date) {
      getEntry();
    }
  }, [date]);


  //Debounce save so as to not spam Database
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      handleSave(); 
    }, 1500); 

    setTypingTimeout(timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [entryContent, entryHabits, entryMood]); 
  
  return (
    <div>
      <div className="entry-container">
        <h1>Edit Entry for {entryDate}</h1>
        <div className="flex-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

          <div style={{ flex: '3', minWidth: '300px' }}>
            <label htmlFor="body">Body Entry:</label>
            <textarea
              value={entryContent}
              onChange={(e) => setEntryContent(e.target.value)}
              rows={10}
              className="entry-body"
            />
          </div>
          <div className="flex-column"
            style={{ flex: '1', minWidth: '300px' }}>
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
                required
                value={entryMood}
                onChange={(e) => setEntryMood(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className='lastSaved'>
          <p>Last Saved: {lastSaved}</p>
        </div>
      </div>
    </div >
  );
};

export default EditEntry;
