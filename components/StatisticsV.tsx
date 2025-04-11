'use client'

import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit, Entry } from '../app/lib/entity';


const Statistics: React.FC = () => {
    console.log("STATISTICS")
  let fileSystem = new FileSystem();

  const [allHabits, setAllHabits] = useState<string[]>([]);
  const [allMoods, setAllMoods] = useState<string[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  //TODO FETCH ALL MOODS IN FILESYSTEM CLASS
  useEffect(() => {
    const fetchHabits = async () => {
        const fs = new FileSystem();
        let habitsList = await fs.listHabits(); 
        const habitNames = habitsList.map((habit) => habit.name);
        setAllHabits(habitNames); 
    };

    fetchHabits();
  }, []);
  return (
    <div>
        <div>
            <label htmlFor="habit-select">Select Habit:</label>
            <select id="habit-select">
                {allHabits.map((habit, index) => (
                    <option key={index} value={habit}>
                        {habit}
                    </option>
                ))}
            </select>
            <label htmlFor="mood-select">Select Mood:</label>
            <select id="mood-select">
                {allMoods.map((mood, index) => (
                    <option key={index} value={mood}>
                        {mood}
                    </option>
                ))}
            </select>
        </div>
    </div>
  );
};

export default Statistics