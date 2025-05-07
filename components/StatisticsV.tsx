'use client'

import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit, Entry } from '../app/lib/entity';
import { Chart } from './graphs/chart';
import { NegativeChart } from './graphs/Negative';
import { count, time } from 'console';
import { ConsistencyChart } from './graphs/Consistency';
import { ProcStat } from '../app/lib/procStat';
import { PositiveChart } from './graphs/Positive';

const Statistics: React.FC = () => {

    const statProcessor = new ProcStat();


    const [allHabitsGUI, setAllHabitsGUI] = useState<string[]>([]);
    const [allMoodsGUI, setAllMoodsGUI] = useState<string[]>([]);

    const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

    const [chartData, setChartData] = useState<any>(null);

    // date and habits
    const [negativeChartData, setNegativeChartData] = useState<any[]>([]); // Data for the chart
    const [selectedTime, setSelectedTime] = useState<string | null>(null); // time frame

    const [positiveChartData, setPositiveChartData] = useState<any[]>([]);
    const [positiveTime, setPositiveTime] = useState<string | null>(null);



    const [consistencyChartData, setConsistencyChartData] = useState<any>(null);
    const [consistencyTime, setConsistencyTime] = useState<string | null>(null);

    //init UI
    useEffect(() => {
        const initUI = async () => {
            let habits = (await statProcessor.fetchHabits());
            let moods = (await statProcessor.fetchMoods())[1];
            setAllHabitsGUI(habits);
            setAllMoodsGUI(moods);
        }
        initUI();
    }, []);

    useEffect(() => {
        const consistencyChartInit = async () => {
            if (!consistencyTime) return;
            const data = await statProcessor.consistencyProc(consistencyTime);
            setConsistencyChartData(data);
        }
        consistencyChartInit();
    }, [consistencyTime]);

    useEffect(() => {
        const habMoodProc = async () => {
            if (!selectedHabit) return;
            const data = await statProcessor.habitMoodProc(selectedHabit);
            setChartData(data);
        }
        habMoodProc();
    }, [selectedHabit]);


    useEffect(() => {
        const negativeHabProc = async () => {
            if (!selectedTime) return;
            const data = await statProcessor.negativeHabitProc(selectedTime);
            setNegativeChartData(data || []);
        }
        negativeHabProc();
    }, [selectedTime]);

    useEffect(() => {
        const positiveHabProc = async () => {
            if (!positiveTime) return;
            const data = await statProcessor.positiveHabitProc(positiveTime);
            setPositiveChartData(data || []);
        }
        positiveHabProc();
    }, [positiveTime]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Statistics</h1>
            <div className='settings-container'>
                <h2>Track Habits and Moods</h2>
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
                {chartData && chartData.length > 0 &&
                    <Chart
                        data={chartData}
                    />
                }
            </div>
            <div className="settings-container">
                <h2>Track Negative Habits</h2>
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
                {negativeChartData && negativeChartData.length > 0 &&
                    <NegativeChart
                        data={negativeChartData}
                    />
                }
                <br />
            </div >
            <div className="settings-container">
                <h2>Track Postive Habits</h2>
                <select id="time-select"
                    className="habit button"
                    onChange={(e) => {
                        const time = e.target.value;
                        setPositiveTime(time);
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
                {positiveChartData && positiveChartData.length > 0 &&
                    <PositiveChart
                        data={positiveChartData}
                    />
                }
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
                {consistencyChartData && consistencyChartData.length > 0 &&
                <ConsistencyChart
                    data={consistencyChartData}
                />
                }
            </div>
        </div >
    );
};

export default Statistics

