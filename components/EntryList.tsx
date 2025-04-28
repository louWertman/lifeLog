'use client';

import { useEffect, useState } from "react";
import { FileSystem } from "../app/lib/dataManagement";

interface EntryType {
  date: string;
  content: string;
  habits: string[];
  mood: string;
}

export default function EntryList() {
  const [entries, setEntries] = useState<EntryType[]>([]);

  const fileSystem = new FileSystem();
  useEffect(() => {
    const fetchEntries = async () => {
      const entriesList = await fileSystem.listEntries();
      const formattedEntries = entriesList.map((entry: any) => ({
        date: entry.date || "",
        content: entry.content || "",
        habits: (fileSystem.habitsToString(entry.habits)) ? entry.habits : [],
        mood: entry.mood || "",
      }));
      console.log("Formatted Entries:", formattedEntries);
      setEntries(formattedEntries);
    };

    fetchEntries();
  }, []);


  return (
    <div className="EntryList">
      <h1>Log</h1>
      <br />
      {entries.map((entry, index) => (
        <div key={index}>
          <br/>
          <strong>{entry.date}</strong>: <br />
          {entry.content}
          <br />
          <strong>Habits:</strong> {entry.habits.join(", ")}
          <br />
          <strong>Mood:</strong> {entry.mood}
          <br />
        </div>
      ))}
      <br />
      <br />
    </div>
  );
}