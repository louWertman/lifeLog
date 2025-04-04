'use client'

import React, { useEffect, useState } from 'react';
import Entry from "../components/entry"; 
import { FileSystem } from "../app/lib/dataManagement"; 
import {Habit} from "../app/lib/entity";

const ListEntry: React.FC = () => {
  const [entries, setEntries] = useState<Array<{ date: string; content: string; habits: string; mood: string }>>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const fileSystem = new FileSystem();
      const entryLog: Array<{ date: string; content: string; habits: Habit[]; mood: string }> = await fileSystem.listEntries(); 
      const detailedEntries = await Promise.all(
        entryLog.map(async (entryData) => {
          const entry = await fileSystem.fetchEntry(entryData.date);
          return {
            date:  entry ? entry.getDateEntry() : '',
            content: entry ? entry.getTextEntry() : '',
            habits: entry ? fileSystem.habitsToString(entry.getHabits()) : '',
            mood: entry ? entry.getMoods() : '',
          };
        })
      );
      setEntries(detailedEntries);
    };

    fetchEntries();
  }, []);

  return (
    <div>
      {entries.length > 0 ? (
        entries.map((entry, index) => (
          <Entry
            key={index}
            date={entry.date}
            content={entry.content}
            habits={entry.habits}
            mood={entry.mood}
          />
        ))
      ) : (
        <p>No entries found.</p>
      )}
    </div>
  );
};

export default ListEntry;