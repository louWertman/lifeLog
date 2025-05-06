'use client'

/*
  For managing settings, handles the database, links to habitsm and displays an about blurb
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
    // add actual validation here at some point
    return true;
  };

  // Updates the settings file 
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

  //fetch settings from file system
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

      {/* basic settings */}
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
            //add here a validation check
            setSettings((prev) => ({ ...prev, dbKey: e.target.value }));
            saveSettings("dbKey", e.target.value)
          }}
          id="db-key"
          placeholder="Enter your database key"
        />
        <br/>

        <br />
        <button
          className="habit button"
          onClick={() => { genDBKey() }}>Generate Key</button>
        <br />
      </div>
      {/* habit editor */}
      <div className="settings-container">
        < EditorHabit />
      </div>
      <div className="settings-container">
        <h2>About</h2>
          This is a journaling application built for speed and simplicity. We built the application around CBT (Cognitive Behavioral Therapy) principles, or the idea that your thoughts, feelings, and behaviors are connected and influence each other. We are DDLL (Dyllan, David, Lou, Luis), a team that built this application for our Capstone project (CPSC354 FALL2024, CPSC355 SPRING2025) for Kutztown University of Pennsylvania. 
          <br /> <br />
          We built this tool around simplicity and control over your data. Many journaling applications on the market are overly complex OR missing key features such as syncing. Additionally we are privacy focused and believe your data is yours, particularly if it contains sensitive information. All information on the database is encrypted and stored locally. You can also sync your data to a remote database using the key above. That choice is up to you. No statistics processing takes place on our servers, all processing is client side.
          <br /> <br />
          <i>Disclaimer: We are not licensed professionals, we believe this tool can provide insight but this is not a replacement for professional help.</i>
      </div>
    </div>
  );
};

export default Settings;
