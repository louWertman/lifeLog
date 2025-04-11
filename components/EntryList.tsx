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

  useEffect(() => {
    const fetchEntries = async () => {
      const fileSystem = new FileSystem();
      const entriesList = await fileSystem.listEntries();
      const formattedEntries = entriesList.map((entry: any) => ({
        date: entry.date || "",
        content: entry.content || "",
        habits: Array.isArray(entry.habits) ? entry.habits : [],
        mood: entry.mood || "",
      }));
      console.log("Formatted Entries:", formattedEntries); 
      setEntries(formattedEntries); 
    };

    fetchEntries();
  }, []);

  return (
    <div className="EntryList">
      <h2>Entries</h2>
      <ul>
        {entries.map((entry, index) => (
          <li key={index}>
            <strong>{entry.date}</strong>: <br />
            {entry.content}
                      </li>
        ))}
      </ul>
    </div>
  );
}