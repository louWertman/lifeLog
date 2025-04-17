'use client';

import React, { useEffect, useState } from 'react';
import { Habit } from '../app/lib/entity';
import '../app/css/entry.module.css';
import Habits from './habits';
import { FileSystem } from '../app/lib/dataManagement';

//TODO [ ] Investigate Blank Content in Entry

interface EditEntryProps {
  date: string;
  content: string;
  habits: string[];
  mood: string;
  onSave: (content: string, date: string, habits: string[], mood: string) => void;
}


const EditEntry: React.FC<EditEntryProps> = ({ mood, habits, content, date, onSave}) => {
  // incase of calendar edit, otherwise date is current date
  let currentDate = date ?? new Date().toISOString().split('T')[0];


  const [entryContent, setEntryContent] = useState(content);
  const [entryDate, setEntryDate] = useState(date);
  const [entryMood, setEntryMood] = useState(mood);
  const [entryHabits, setEntryHabits] = useState<string[]>(habits);

  const handleSave = () => {
    setEntryDate(currentDate)
    onSave(entryContent, entryDate, entryHabits, entryMood);
  };

  useEffect(() => {
    const getEntry = async () => {
      let fs = new FileSystem();
      const entryFetch = await fs.fetchEntry(date);
      if (!entryFetch) {
        return;
      }
      setEntryContent(entryFetch.textEntry);
      setEntryMood(entryFetch.mood);
      setEntryHabits(entryFetch.habits.map((habit: Habit) => habit.name));
    };

    if (date) {
      getEntry();
    }
  }, [date]);

  return (

    //todo make update habits a seperate popup menu and add habits its own thing
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
