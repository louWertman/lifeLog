'use client'

import React, { useEffect, useState } from 'react';
import EntryV from "../components/entry";
import { FileSystem } from "../app/lib/dataManagement"; 
import {Habit} from "../app/lib/entity";
import '../app/css/entry.module.css';

const ListEntry: React.FC = () => {
  console.log("VIEW ENTRYLIST");
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
      console.log(detailedEntries);
      setEntries(detailedEntries);
    };

    fetchEntries();
  }, []);

  return (
    <div className="list-body">
    <div className="entry-list">
      {entries.length > 0 ? (
        entries.map((entry, index) => (
          <EntryV
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
    </div>
  );
};

export default ListEntry;