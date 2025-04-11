'use client'

import React, { useEffect } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit } from '../app/lib/entity';

interface selectedAttributes {
    selectedHabit: Habit | null;
    selectedMood: string | null;
    allHabits: string[];
    allMoods: string[];
}

const Statistics: React.FC<selectedAttributes> = ({ selectedHabit, selectedMood, allHabits, allMoods }) => {
    console.log("STATISTICS")
    const fileSystem = new FileSystem();


    //TODO FETCH ALL MOODS IN FILESYSTEM CLASS
    useEffect(() => {
        const fetchHabits = async () => {
            let habitsList = await fileSystem.listHabits();
            const habitNames = habitsList.map((habit) => habit.name);
            allHabits.splice(0, allHabits.length, ...habitNames);
        };

        fetchHabits();
    }, []);

    return (
        <div>
            <label htmlFor="habit-select">Select Habit:</label>
            <select id="habit-select">
                {
                    allHabits.map((habit: string, index: number) => (
                        <option key={index} value={habit}>
                            {habit}
                        </option>
                    ))
                }
            </select>
            <label htmlFor="mood-select">Select Mood:</label>
            <select id="mood-select">
                {
                    allMoods.map((mood: string, index: number) => (
                        <option key={index} value={mood}>
                            {mood}
                        </option>
                    ))
                }
            </select>
        </div>
    );
};

export default Statistics;