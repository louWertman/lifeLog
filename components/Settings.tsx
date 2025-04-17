'use client'

import React, {useEffect, useState} from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import EditorHabit from './editorHabit';

const Settings: React.FC = () => {

  const [settings, setSettings] = useState({
    theme: "dark",
    dbKey: "",
    habits: [],
  });

  // Load settings from file system
  
  const saveSettings = async (setting: string, update: string) => {
    const fs = new FileSystem();
    await fs.updateSettings(setting, update);
  };

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
      <h1>Settings</h1>
      <div>
        <label htmlFor="theme">Theme:</label>
        <select id="theme"
        value={settings.theme}
        onChange={(e)=> saveSettings("theme", e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>

        <label htmlFor="Database key">Database Key</label>
        <input type="text"
        value={settings.dbKey}
        onChange={(e)=> saveSettings("dbKey", e.target.value)}
        id="db-key" 
        placeholder="Enter your database key"
        />
        <br />
        <br />
        -----------
        <br />
        < EditorHabit />
      </div>
    </div>
  );
};

export default Settings;
