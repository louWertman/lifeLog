'use client'

import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit } from '../app/lib/entity';
import { Chart } from './chart';

const Statistics: React.FC = () => {
    console.log("STATISTICS")
    const fs = new FileSystem();

    //GUI is for display, but raw data is passed to chart component
    const [allHabitsGUI, setAllHabitsGUI] = useState<string[]>([]);
    const [allMoodsGUI, setAllMoodsGUI] = useState<string[]>([]);

    const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
    const [allHabits, setAllHabits] = useState<string[]>([]);
    const [allMoods, setAllMoods] = useState<string[]>([]);

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchHabits = async () => {
            let habitsList = await fs.listAllHabits();
            const habitNames = habitsList.map((habit) => habit.name);
            setAllHabits(habitNames);
            setAllHabitsGUI(habitNames);

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
    useEffect(() => {
        const dataProc = async () => {
            if (!selectedHabit) return;

            const entryLog = await fs.entryLog;
            const moodCounts: { [mood: string]: number } = {};

            for (const entry of entryLog) {
                const habits = entry.habits.map((habit: { name: string }) => habit.name);
                if (habits.includes(selectedHabit)) {
                    const mood = entry.mood;
                    if (!moodCounts[mood]) {
                        moodCounts[mood] = 0;
                    }
                    moodCounts[mood]++;
                }
            }

            if (Object.keys(moodCounts).length === 0) {
                const allMoods = await fs.listAllMoods();
                allMoods.forEach((mood) => {
                    if (!moodCounts[mood]) {
                        moodCounts[mood] = 0;
                    }
                });
            }

            const data = Object.entries(moodCounts).map(([mood, count]) => ({
                mood,
                count,
            }));

            console.log("DATA from STATVIEW: ", data);
            console.log("STATVIEW: for habit: " + selectedHabit);

            setChartData(data);
        };
        dataProc();
    }, [selectedHabit]);
    return (
        <div>
            <div>
                <label htmlFor="habit-select">Select Habit:   </label>
                <select id="habit-select"
                    className="habit button"
                    onChange={(e) => {
                        const habit = e.target.value;
                        setSelectedHabit(habit);
                    }}>
                    <option value="" disabled selected className="habit-item">
                        -- Select a Habit --
                    </option>
                    {allHabitsGUI.map((habit, index) => (
                        <option key={index} value={habit} className="habit-item">
                            {habit}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <br/>
                <Chart
                    data={chartData}
                />
            </div>
        </div>
    );
};

export default Statistics