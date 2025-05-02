'use client';

import styles from "./css/page.module.css";
import Statistics from "../components/StatisticsV";
import EntryList from "../components/EntryList";
import EditEntry from "../components/EditEntry";
import Settings from "../components/Settings";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/calendar-overrides.css';
import { Entry, Habit } from "../app/lib/entity";
import { FileSystem } from "../app/lib/dataManagement";
import { useState, useEffect, useRef } from "react";



type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState<EntryType | null>(null);
  const [view, setView] = useState("entry");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar toggle
  const sideBarRef = useRef<HTMLDivElement>(null);

  interface EntryType {
    date: string;
    content: string;
    habits: string[];
    mood: string;
  }

  useEffect(() => {
    
      const handleOutsideClick = (event: MouseEvent) => {
        if (sideBarRef.current && !sideBarRef.current.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
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

    console.log("HABITS FOR ENTRY: ", habitsForEntry);

    let entry = new Entry(
      date,
      mood,
      habitsForEntry,
      content
    );

    await fileSystem.saveEntry(entry);
  };

  const handleCreateEntry = () => {
    const currentDate = new Date().toLocaleString('en-ET').split(",")[0];
    setSelectedEntry({
      date: currentDate, content: "", habits: [], mood: "",
    });
    setView("edit");
  };

  // calendar selection

  const [value, onChange] = useState<Value>(new Date());

  function handleDateChange(nextValue: Value) {
    onChange(nextValue);
    if (nextValue !== null) {
      setSelectedEntry({
        date: nextValue.toLocaleString('en-ET').split(",")[0],
        content: "",
        habits: [],
        mood: "",
      });
      setView("edit");
      // setValue(nextValue);
    }
  }

  // return (
  //   <Calendar
  //     onChange={onChange}
  //     value={value}
  //   />
  // );

  // calendar onchange
  // onChange={}onChange can work to run a function with the date
  // const [value, onChange] = useStateValue (new Date());

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Sidebar / Hamburger Menu */}
        <div ref={sideBarRef} className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
          <h1 className={styles.title} onClick={() => setView("entry")}>LifeLog</h1>
          <div className={styles.calendarContainer}>
            <main className={styles.calendarContent}>
              <Calendar onChange={handleDateChange} value={value} calendarType="gregory" />
            </main>
          </div>
          <button className="button" onClick={handleCreateEntry}>Create Entry</button>
          <button className="button" onClick={() => setView("entry")}>Entry List</button>
          <button className="button" onClick={() => setView("statisticsv")}>Statistics</button>
          <button className="button" onClick={() => setView("settings")}>Settings</button>
        </div>

        {/* Hamburger Icon */}
        <button
          className={styles.hamburger}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>

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
          {view === "statisticsv" && <Statistics />}
        </div>
      </main>
    </div>
  );
}

