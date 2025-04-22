'use client'

import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit } from '../app/lib/entity';
import { Chart } from './chart';

const Statistics: React.FC = () => {
    console.log("STATISTICS")
  let fileSystem = new FileSystem();

  //GUI is for display, but raw data is passed to chart component
  const [allHabitsGUI, setAllHabitsGUI] = useState<string[]>([]);
  const [allMoodsGUI, setAllMoodsGUI] = useState<string[]>([]);

  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [allHabits, setAllHabits] = useState<string[]>([]);
  const [allMoods, setAllMoods] = useState<string[]>([]);

  useEffect(() => {
    const fs = new FileSystem();
    const fetchHabits = async () => {
        let habitsList = await fs.habitArrStatistics(); 
        const habitNames = habitsList.map((habit) => habit.name);
        setAllHabits(habitNames);
        const uniqueHabits = Array.from(new Set(habitNames)); // Deduplicate
        setAllHabitsGUI(uniqueHabits); 

    };
    const fetchMoods = async () => {
        const moodsList: string[] = await fs.listAllMoods();
        const moodNames = moodsList.map((mood) => mood); 
        console.log("MOODS: ", moodNames);
        setAllMoods(moodsList);
        const uniqueMoods = Array.from(new Set(moodNames)); // Deduplicate
        setAllMoodsGUI(uniqueMoods);
    };

    fetchHabits();
    fetchMoods();
  }, []);
  return (
    <div>
        <div>
            <label htmlFor="habit-select">Select Habit:</label>
            <select id="habit-select"
                onChange={(e) => {
                    const habit = e.target.value;
                    setSelectedHabit(habit);
                }}>
                {allHabitsGUI.map((habit, index) => (
                    <option key={index} value={habit}>
                        {habit}
                    </option>
                ))}
            </select>
            <label htmlFor="mood-select">Select Mood:</label>
            <select id="mood-select"
                onChange={(e) => {
                    const mood = e.target.value;
                    setSelectedMood(mood);
                }}>
                {allMoodsGUI.map((mood, index) => (
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
        </div>
    </div>
  );
};

export default Statistics