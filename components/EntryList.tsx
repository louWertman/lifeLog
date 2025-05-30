'use client';

/*
  Displays list of entries and allows you to edit them if you click on them, allows deletion and exporting
*/

import React, { useEffect, useState, memo} from "react";
import { FileSystem } from "../app/lib/dataManagement";
import EditEntry from "./EditEntry";
import { Entry, Habit } from "../app/lib/entity";
import Export from './Export';
import '../app/css/entry.module.css';

interface EntryType {
  date: string;
  content: string;
  habits: { name: string; positive: boolean; active: boolean }[];
  mood: string;
}

const  EntryList: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<EntryType | null>(null);
  const [entries, setEntries] = useState<EntryType[]>([]);


  // Fetch entries from the FileSystem class when the component mounts
  const fileSystem = new FileSystem();

  useEffect(() => {
    setSelectedEntry(null);
    const fetchEntries = async () => {
      const entriesList = await fileSystem.listEntries();
      const formattedEntries = entriesList.map((entry: any) => ({
        date: entry.date || "",
        content: entry.content.replace(/\\n/g, '\n') || "",
        habits: (fileSystem.habitsToString(entry.habits)).split(':')[0] ? entry.habits : [],
        mood: entry.mood || "",
      }));
      console.log("Formatted Entries:", formattedEntries);
      setEntries(formattedEntries);
    };

    fetchEntries();
  }, []);

  const handleDelete = async (date: string): Promise<void> => {
    await fileSystem.deleteEntry(date);
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.date !== date));
  };

  const handleSave = async (content: string, date: string,
    habitNames: string[], mood: string): Promise<void> => {
    
    let habitList = await fileSystem.listHabits();
    let habitsForEntry: Habit[] = [];

    habitList.forEach(habitInList => {
      if (habitNames.includes(habitInList.name)) {
        habitsForEntry.push(habitInList);
      }
    });

    const entry = new Entry(date, mood, habitsForEntry, content);
    await fileSystem.saveEntry(entry);

    //reupdate entryList
    setEntries((prevEntries) =>
      prevEntries.map((e) =>
        e.date === date ? { ...e, content: content.replace(/\\n/g, '\n'), habits: habitsForEntry, mood } : e
      )
    );
  };

  return (
    <div className="EntryList">
      {/* <h1>Log</h1> */}
      <Export data={entries} />
      <br />
      {entries.map((entry, index) => (
        <div
          key={index}
          onClick={() =>
            setSelectedEntry(prev => (prev?.date === entry.date ? null : entry))
          }
          className="settings-container"
        >
          <br />
          <strong>{entry.date}</strong>: <br />
          {entry.content.length > 155
            ? `${entry.content.substring(0, 155)}...`
            : entry.content}
          <br />
          <strong>Habits:</strong> {entry.habits.map(h => h.name).join(', ')}
          <br />
          <strong>Mood:</strong> {entry.mood}

          {selectedEntry && selectedEntry.date === entry.date && (
            <div onClick={e => e.stopPropagation()}>
              <EditEntry
                date={selectedEntry.date}
                content=""
                habits={[]}
                mood=""
                onSave={handleSave}
              />
            </div>
          )}
          <br />
          <br />
          <button
            onClick={e => {
              e.stopPropagation();
              handleDelete(entry.date);
            }}
            className="habit button"
          >
            Delete
          </button>
          <br />
        </div>
      ))}
      <br />
      <br />
    </div>
  );
}

export default memo(EntryList);