import React, { useEffect, useState, PureComponent, use } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit, Entry } from '../app/lib/entity';

const EditorHabit: React.FC = () => {

    useEffect(() => {

    }, []);

    return (
        <div>
            <h2>Habit Editor</h2>
            <label htmlFor="habit-select">Select Habit:</label>

            <select id="habit-select">
            </select>
        </div>
    );
};

export default EditorHabit;