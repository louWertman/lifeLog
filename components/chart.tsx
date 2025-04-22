import React, { useEffect, useState, PureComponent } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit, Entry } from '../app/lib/entity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface chartProps {
    allHabits: string[];
    allMoods: string[];
    selectedHabit: string | null;
    selectedMood: string | null;
}

export const Chart: React.FC<chartProps> = ({ allHabits, allMoods, selectedHabit, selectedMood }) => {
    const [habitList, setHabitList] = useState<string[]>([]);
    const [moodList, setMoodList] = useState<string[]>([]);
    const [habitSelect, setHabitSelect] = useState<string | null>(null);
    const [moodSelect, setMoodSelect] = useState<string | null>(null);

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        setHabitList(allHabits);
        setMoodList(allMoods);
        setHabitSelect(selectedHabit);
        setMoodSelect(selectedMood);

        const dataProc = async () => {
            const data: any[] = [];
            const fs = new FileSystem();
            const el = fs.entryLog;
            let habitMoodData: {
                [habit: string]: {
                    [mood: string]: number;
                }
            } = {};
            for (let entry of await el) {
                const habits = (entry.habits as Habit[]).map(habit => habit.name);
                for (const habit of habits) {
                    const mood = entry.mood;
                    if (!habitMoodData[habit]) {
                        habitMoodData[habit] = {};
                    }
                    if (!habitMoodData[habit][mood]) {
                        habitMoodData[habit][mood] = 0;
                    }
                    habitMoodData[habit][mood]++;
                }
            }
                setChartData(Object.entries(habitMoodData).map(([habit, moods]) => ({
                    habit,
                    ...moods,
                })));
            };
            dataProc();
        }, [allHabits, allMoods, selectedHabit, selectedMood]);

    if (habitList.length === 0 || moodList.length === 0) {
        return <div>There are no entries to load data from</div>;
    }

    return (
        <BarChart
        width={800}
        height={400}
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="habit" />
        <YAxis />
        <Tooltip />
        <Legend />
        {allMoods.map((mood) => (
            <Bar key={mood} dataKey={mood} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
        ))}
    </BarChart>
    );
}