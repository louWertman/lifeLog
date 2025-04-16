'use client'

import React from 'react';
import EditorHabit from './editorHabit';

const Settings: React.FC = () => {
  return (
    <div>
      <h1>Settings</h1>
      <div>
        <label htmlFor="theme">Theme:</label>
        <select id="theme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>

        <br />
        <label htmlFor="Habits">Habits:</label>
        < EditorHabit />

        <br />
        -----------
        <br />
        <label htmlFor="Database key">Database Key</label>
        <input type="text" id="db-key" placeholder="Enter your database key" />
      </div>
    </div>
  );
};

export default Settings;
