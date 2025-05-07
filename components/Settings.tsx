'use client'

/*
  For managing settings, handles the database, links to habits, and displays an about blurb.
  Includes logic for syncing local storage with the database upon entering a sync key.
*/

import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import EditorHabit from './editorHabit';
import Export from './Export';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: "dark",
    dbKey: "",
    habits: [],
  });

  const keyValidation = (key: string) => {
    return key.length > 0; // Simple validation for now
  };

  //  Updates the settings file 
  const saveSettings = async (setting: string, update: string) => {
    const fs = new FileSystem();
    await fs.updateSettings(setting, update);
  };

  // Logic for generating a new key and syncing it
  const genDBKey = async () => {
    const fs = new FileSystem();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const randomPart = Math.random().toString(36).substring(2, 8);
    const newKey = `${datePart}-${timePart}-${randomPart}`;
  
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: newKey }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        console.log("Got token from backend:", data.token);

        setSettings((prev) => ({ ...prev, dbKey: data.token, sync: 1 }));
        await saveSettings("dbKey", data.token);
        await saveSettings("sync", "1");
        window.alert(`Token generated & synced: ${data.token}`);
        
        await fs.syncAllPastHabitsToDB();
        await fs.syncAllEntriesToDB();
      } else {
        console.error("Signup failed or token missing:", data);
        window.alert("Signup failed. Check console.");
      }

    } catch (err) {
      console.error("Signup fetch failed:", err);
      window.alert("Signup fetch failed.");
    }
  };

  // Logic to fetch from DB and sync locally
  const syncFromDB = async () => {
    const fs = new FileSystem();
    if (keyValidation(settings.dbKey)) {
      await fs.fetchAndSyncFromDB(settings.dbKey);
      window.alert("Data fetched and synced locally.");
    } else {
      window.alert("Please enter a valid DB key.");
    }
  };

  // Fetch settings from file system on load
  useEffect(() => {
    const fs = new FileSystem();
    const fetchSettings = async () => {
      const savedSettings = await fs.getSettings();

      setSettings({
        theme: savedSettings.theme || "dark",
        habits: savedSettings.habits || [],
        dbKey: savedSettings.dbKey || "",
      });
    };

    fetchSettings();
  }, []);

  return (
    <div className="Settings">
      <h1>Settings</h1>
      <div className="settings-container">
        <h2>Sync Settings</h2>
        <br />
        <label htmlFor="Database key">Database Key: </label>
        <input 
          className="mood-container"
          type="text"
          value={settings.dbKey}
          onChange={(e) => {
            setSettings((prev) => ({ ...prev, dbKey: e.target.value }));
            saveSettings("dbKey", e.target.value);
          }}
          id="db-key"
          placeholder="Enter your database key"
        />
        <br />
        <br />
        <button
          className="habit button"
          onClick={genDBKey}
        >
          Generate Key
        </button>
        <br />
        <button
          className="habit button"
          style={{ marginTop: '10px' }}
          onClick={syncFromDB}
        >
          Sync from DB
        </button>
        <br />
      </div>
      
      {/* habit editor */}
      <div className="settings-container">
        < EditorHabit />
      </div>
      <div className="settings-container">
        <h2>About</h2>
        This is a journaling application built for speed and simplicity... 
      </div>
    </div>
  );
};

export default Settings;
