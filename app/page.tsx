'use client'
import Image from "next/image";
import styles from "./page.module.css";
import Entry from "../components/entry"; // Import the Entry component
import EntryList from "../components/EntryList"; // Import the EmptyEntry component
import EditEntry from "../components/EditEntry"; // Import the EditEntry component
import Settings from "../components/Settings"; // Import the Settings component
import { useState } from "react";
import { Capacitor } from '@capacitor/core';

export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState<EntryType | null>(null);
  const [view, setView] = useState("empty");

  let entries = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Entry ${i + 1}`,
    content: `Content for entry ${i + 1}`,
    date: `2023-10-${String(i + 1).padStart(2, '0')}`
  }));

  interface EntryType {
    id: number;
    title: string;
    content: string;
    date: string;
  }

  const handleSave = (id: number, title: string, content: string, date: string): void => {
    const updatedEntries = entries.map((entry: EntryType) =>
      entry.id === id ? { id, title, content, date } : entry
    );
    entries = updatedEntries;
    setView("empty");
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.sidebar}>
          <h1 className={styles.title}>LifeLog</h1>
          <button onClick={() => setView("empty")}>Entries</button>
          <button onClick={() => setView("settings")}>Settings</button>
          <button onClick={() => setView("edit")}>Create Entry</button>
        </div>
        <div className={styles.dynamicArea}>
          {view === "empty" && <EntryList />}
          {view === "edit" && selectedEntry && (
            <EditEntry
              id={selectedEntry.id}
              title={selectedEntry.title}
              content={selectedEntry.content}
              date={selectedEntry.date}
              onSave={handleSave}
            />
          )}
          {view === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}

function init(){
  // detect the platform
  let platform = Capacitor.getPlatform();
  if(platform == "web"){
    if (navigator.userAgent.includes('Electron')){
      initDesktop();
    }
    else{
      initWebBrowser();
    }
  }else if(platform == "ios" || platform == "android"){
    initMobile();
  } else {
    document.write("Unsupported Platform");
  }
}

function initWebBrowser(){
  //edit this to only display if not logged in
  return ('<div class="alert">Web Version only works with database, please logon in settings to sync"</div>')
}

function initMobile(){
  if (localStorage.getItem('fileLocation') == null){

  }
}

function initDesktop(){
  ;
}