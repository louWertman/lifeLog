'use client'

import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Chart } from './chart';

const Statistics: React.FC = () => {
    console.log("STATISTICS")
  let fileSystem = new FileSystem();

  const [allHabits, setAllHabits] = useState<string[]>([]);
  const [allMoods, setAllMoods] = useState<string[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    const fs = new FileSystem();
    const fetchHabits = async () => {
        let habitsList = await fs.listAllHabits(); 
        const habitNames = habitsList.map((habit) => habit.name);
        const uniqueHabits = Array.from(new Set(habitNames)); // Deduplicate
        setAllHabits(uniqueHabits); 

    };
    const fetchMoods = async () => {
        const moodsList: string[] = await fs.listAllMoods();
        const moodNames = moodsList.map((mood) => mood); 
        console.log("MOODS: ", moodNames);
        setAllMoods(moodNames);
    };

    fetchHabits();
    fetchMoods();
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
        <div>
        <Chart
            allHabits={allHabits}
            allMoods={allMoods}
            selectedHabit={selectedHabit}
            selectedMood={selectedMood}
        />
        <p>INSERT RECHART COMPONENT HERE</p>
        </div>
    </div>
  );
};

export default Statistics