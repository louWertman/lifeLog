'use client';

import { useEffect, useState } from "react";
import { FileSystem } from "../app/lib/dataManagement";
import EditEntry from "./EditEntry";
import { Entry, Habit } from "../app/lib/entity";
import Export from './Export';
import "../app/css/entry.module.css";

interface EntryType {
  date: string;
  content: string;
  habits: { name: string; positive: boolean; active: boolean }[]; // Updated type
  mood: string;
}

export default function EntryList() {
  const [selectedEntry, setSelectedEntry] = useState<EntryType | null>(null);
  const [entries, setEntries] = useState<EntryType[]>([]);

  const fileSystem = new FileSystem();
  useEffect(() => {
    setSelectedEntry(null);
    const fetchEntries = async () => {
      const entriesList = await fileSystem.listEntries();
      const formattedEntries = entriesList.map((entry: any) => ({
        date: entry.date || "",
        content: entry.content || "",
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
      habitNames.forEach(habitName => {
        if (habitInList.name === habitName) {
          habitsForEntry.push(habitInList);
        }
      });
    });

    let entry = new Entry(
      date,
      mood,
      habitsForEntry,
      content
    );

    await fileSystem.saveEntry(entry);

    //reupdate entryList
    setEntries((prevEntries) =>
      prevEntries.map((e) =>
        e.date === date ? { ...e, content, habits: habitsForEntry, mood } : e
      )
    );
  };

  return (
    <div className="EntryList">
      <h1>Log</h1>
      <Export data={entries} />
      <br />
      {entries.map((entry, index) => (
        <div
          key={index}
          onClick={() =>
            setSelectedEntry((prevEntry) =>
              prevEntry?.date === entry.date ? null : entry
            )
          }
          className="settings-container"
        >
          <br />
          <strong>{entry.date}</strong>: <br />
          {entry.content.length > 155
            ? `${entry.content.substring(0, 155)}...`
            : entry.content}          <br />
          <strong>Habits:</strong> {entry.habits.map((habit: any) => habit.name).join(", ")}
          <br />
          <strong>Mood:</strong> {entry.mood}

          {selectedEntry && selectedEntry.date === entry.date && (
            <div onClick={(e) => e.stopPropagation()}
            >
              <EditEntry
                date={selectedEntry.date}
                content=""
                habits={[]}
                mood=""
                onSave={(content, date, habits, mood) =>
                  handleSave(content, date, habits, mood)
                }
              />
            </div>
          )}
          <br />
          <br />
          <button
            onClick={(e) => {
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