'use client'

import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit, Entry } from '../app/lib/entity';
import { Chart } from './graphs/chart';
import { NegativeChart } from './graphs/Negative';
import { count, time } from 'console';
import { ConsistencyChart } from './graphs/Consistency';

const Statistics: React.FC = () => {
    const fs = new FileSystem();


    //GUI is for display, but raw data is passed to chart component
    //habits and moods
    const [allHabitsGUI, setAllHabitsGUI] = useState<string[]>([]);
    const [allMoodsGUI, setAllMoodsGUI] = useState<string[]>([]);

    const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
    const [allHabits, setAllHabits] = useState<string[]>([]);
    const [allMoods, setAllMoods] = useState<string[]>([]);

    const [chartData, setChartData] = useState<any[]>([]);

    // date and habits
    const [negativeChartData, setNegativeChartData] = useState<any[]>([]); // Data for the chart


    const [selectedTime, setSelectedTime] = useState<string | null>(null); // time frame

    const [consistencyChartData, setConsistencyChartData] = useState<any>(null);
    const [consistencyTime, setConsistencyTime] = useState<string | null>(null);

    //Length of Entry to Habit IF I HAVE TIME

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
        const consistencyProc = async () => {
            let entryLog = await fs.listEntries();
            if (!consistencyTime) return;
            let dateRange = calculateDate(consistencyTime);
            if (!dateRange) return;

            let data = [];

            for (let entry of entryLog) {
                for (let date of dateRange){
                    if(entry.date==date.toLocaleString('en-ET').split(',')[0])
                    data.push({
                        date: entry.date,
                        length: entry.content.length
                    });
                }
            }
            setConsistencyChartData(data);
        };

        consistencyProc();
    }, [consistencyTime]);

    useEffect(() => {
        const habMoodProc = async () => {
            if (!selectedHabit) return;

            let entryLog = await fs.listEntries()
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

        habMoodProc();
    }, [selectedHabit]);

    const calculateDate = (timeFrame: string) => {
        let dateRange: Date[] = [];
        let startDate: Date;
        let currentDate = new Date();

        switch (timeFrame.toString()) {
            case "Week":
                startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - 7);
                break;
            case "Month":
                startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - 30);
                break;
            case "Year":
                startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - 365);
                break;
            default:
                console.error("Invalid time frame selected");
                return;
        }

        // Generate the date range from startDate to currentDate
        for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
            dateRange.push(new Date(d));
        }

        return dateRange;
    }

    useEffect(() => {
        const negativeHabProc = async () => {
            if (!selectedTime) return;
            const dateRange = calculateDate(selectedTime);

            if (!dateRange) return;

            let entryLog = await fs.listEntries();

            let negativeHabitCounter = 0;
            let data: any = [];

            for (let date of dateRange) {
                negativeHabitCounter = 0;
                for (const entry of entryLog) {
                    if (new Date(entry.date).toLocaleString('en-ET').split(',')[0] === date.toLocaleString('en-ET').split(',')[0]) {
                        for (const habit of entry.habits) {
                            if (habit.positive === false) {
                                negativeHabitCounter++;
                            }
                        }
                    }
                    data.push({
                        date: date.toLocaleString('en-ET').split(',')[0],
                        count: negativeHabitCounter,
                    });
                }
            };
            setNegativeChartData(data);
        }
        negativeHabProc();
    }, [selectedTime]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Statistics</h1>
            <div className='settings-container'>
                <h2>Track Habits and Moods</h2>
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
                <Chart
                    data={chartData}
                />
            </div>
            <div className="settings-container">
                <h2>Track Negative Habits</h2>
                <label htmlFor="habit-select">Select Time Frame:   </label>
                <select id="time-select"
                    className="habit button"
                    onChange={(e) => {
                        const time = e.target.value;
                        setSelectedTime(time);
                    }
                    }>
                    <option value="" disabled selected>
                        -- Select a Time Frame --
                    </option>
                    <option value="Week" >
                        Week
                    </option>
                    <option value="Month" >
                        Month
                    </option>
                    <option value="Year" >
                        Year
                    </option>
                </select>
                <NegativeChart
                    data={negativeChartData}
                />
                <br />
            </div >
            <div className="settings-container">
                <h2>Entry Length Over Time</h2>
                <select id="time-select"
                    className="habit button"
                    onChange={(e) => {
                        const time = e.target.value;
                        setConsistencyTime(time);
                    }
                    }>
                    <option value="" disabled selected>
                        -- Select a Time Frame --
                    </option>
                    <option value="Week" >
                        Week
                    </option>
                    <option value="Month" >
                        Month
                    </option>
                    <option value="Year" >
                        Year
                    </option>
                </select>
                <ConsistencyChart
                    data={consistencyChartData}
                />
            </div>
        </div >
    );
};

export default Statistics