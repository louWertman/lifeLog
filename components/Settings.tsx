'use client'

import React, {useEffect, useState} from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import EditorHabit from './editorHabit';
import { fallbackModeToStaticPathsResult } from 'next/dist/lib/fallback';

const Settings: React.FC = () => {

  const [settings, setSettings] = useState({
    theme: "dark",
    dbKey: "",
    habits: [],
  });

  const keyValidation = (key: string) => {
    // add actual validation here at some point
    return true;
  };

  // Load settings from file system
  
  const saveSettings = async (setting: string, update: string) => {
    const fs = new FileSystem();
    await fs.updateSettings(setting, update);
  };


  /******add logic for generating a key*********/
  const genDBKey = () => {
    //add logic here
    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const randomPart = Math.random().toString(36).substring(2, 8); // extra uniqueness

    const newKey = `${datePart}-${timePart}-${randomPart}`;

    setSettings((prev) => ({ ...prev, dbKey: newKey }));
    saveSettings("dbKey", newKey);
    window.alert(`Key generated: ${newKey}`); //try to print out key 
    //window.alert("Key generated");
  }

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
    <div>
      
      {/* basic settings */}
      <div className="settings-container">
        <h1>Settings</h1>
        <label htmlFor="theme">Theme: </label>
        <select id="theme"
        value={settings.theme}
        onChange={(e)=> saveSettings("theme", e.target.value)}>
      <div className="settings-container">
        <h1>Settings</h1>
        <label htmlFor="theme">Theme: </label>
        <select
          id="theme"
          value={settings.theme}
          onChange={(e) => {
            const themeUpdate = e.target.value;
            setSettings((prev) => ({ ...prev, theme: themeUpdate }));
            saveSettings("theme", e.target.value);
          }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <br></br>

        <label htmlFor="Database key">Database Key: </label>
        <input type="text"
        value={settings.dbKey}
        onChange={(e)=> {
          //add here a validation check
          setSettings((prev) => ({ ...prev, dbKey: e.target.value }));
          saveSettings("dbKey", e.target.value)}}
        id="db-key" 
        placeholder="Enter your database key"
        />
        <br />
        <button onClick={() => {genDBKey()}}>Generate Key</button>
        <br />
        </div>

        {/* habit editor */}
        <div className="settings-container">
          < EditorHabit />
      </div>
    </div>
  );
};

export default Settings;
