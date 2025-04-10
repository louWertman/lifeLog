'use client';

import styles from "./css/page.module.css";
import EntryV from "../components/entry"; // Import the Entry component
import EntryList from "../components/EntryList"; // Import the EmptyEntry component
import EditEntry from "../components/EditEntry"; // Import the EditEntry component
import Settings from "../components/Settings"; // Import the Settings component
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/calendar-overrides.css';
import { Entry, Habit } from "../app/lib/entity"; // Import the Entry class
import { FileSystem } from "../app/lib/dataManagement"; // Import the FileSystem module
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState<EntryType | null>(null);
  const [view, setView] = useState("entry");



  interface EntryType {
    date: string;
    content: string;
    habits: string[];
    mood: string;
  }

  let entries: Array<EntryType> = [];
  useEffect(() => {
    const fetchEntries = async () => {
      let fileSystem = new FileSystem();
      let entriesList = await fileSystem.listEntries();
      entries = entriesList.map((entry: any) => ({
        date: entry.date || "",
        content: entry.content || "",
        habits: Array.isArray(entry.habits) ? entry.habits : [],
        mood: entry.mood || "",
      })) as EntryType[];
    };
    fetchEntries();
  }, []);


  const handleSave = async (content: string, date: string,
    habitNames: string[], mood: string): Promise<void> => {
    let fileSystem = new FileSystem();
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
  };

  const handleCreateEntry = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    setSelectedEntry({
      date: currentDate, content: "", habits: [], mood: "",
    });
    setView("edit");
  };

// calendar onchange
// onChange={}onChange can work to run a function with the date
// const [value, onChange] = useStateValue (new Date());

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.sidebar}>
          <h1 className={styles.title} onClick={() => setView("empty")}>LifeLog</h1>
          <div className={styles.calendarContainer}>
            <main className={styles.calendarContent}>
              <Calendar calendarType="gregory" /> 
              {/* onChange={function} will let you take the date and pass it into a function 
              this will be great but we need a function to either open a date or create it if it doesnt exist
              i also want to figure out how to make the weekdays be just the first letter SMTWTFS*/}
            </main>
          </div>
          <button className="button" onClick={handleCreateEntry}>Create Entry</button>
          <button className="button" onClick={() => setView("entry")}>Entry List</button>
          <button className="button" onClick={() => setView("settings")}>Settings</button>
        </div>
        <div className={styles.dynamicArea}>
          {view === "entry" && <EntryList />}
          {view === "edit" && selectedEntry && (
            <EditEntry
              date={selectedEntry.date}
              content={selectedEntry.content}
              habits={selectedEntry.habits}
              mood={selectedEntry.mood}
              onSave={handleSave}
            />
          )}
          {view === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}

