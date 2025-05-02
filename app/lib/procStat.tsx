/*
File for processing statistics
*/

import { FileSystem } from './dataManagement';
import { Entry, Habit } from './entity';

export class ProcStat {
    private fs = new FileSystem;
    private entryLog: Promise<any>;

    constructor() {
        this.entryLog = this.fs.listEntries();
    }

    public async fetchHabits() {

        let habitsList = await this.fs.listAllHabits();
        let habitNames = habitsList.map((habit) => habit.name);
        return habitNames;
    }

    public async fetchMoods() {
        const moodsList: string[] = await this.fs.listAllMoods();
        const moodNames = moodsList.map((mood) => mood);

        const uniqueMoods = Array.from(new Set(moodNames)); // Deduplicate

        return [moodNames, uniqueMoods];

    }

    public async habitMoodProc(selectedHabit: string) {
        if (!selectedHabit) return;

        const entryLog = await this.entryLog;
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
            const allMoods = (await this.fetchMoods())[1];
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

        return data;
    }

    public async negativeHabitProc(selectedTime: string) {
        const entryLog = await this.entryLog;
        if (!selectedTime) return;
        const dateRange = this.calculateDate(selectedTime);

        if (!dateRange) return;


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
            }
            data.push({
                date: date.toLocaleString('en-ET').split(',')[0],
                count: negativeHabitCounter,
            });
        };
        return data;
    }

    public async consistencyProc(consistencyTime: string) {
        const entryLog = await this.entryLog;
        if (!consistencyTime) return;
        let daterange = this.calculateDate(consistencyTime);
        if (!daterange) return;

        let data = [];

        for (let date of daterange) {
            let totalLength = 0;
            let hasEntry = false;

            for (let entry of entryLog) {
                if (entry.date === date.toLocaleString('en-et').split(',')[0]) {
                    totalLength += entry.content.length;
                    hasEntry = true;
                }
            }

            data.push({
                date: date.toLocaleString('en-ET').split(',')[0],
                length: hasEntry ? totalLength : 0, // Add total length if entries exist, otherwise 0
            });
        }

        return data;
    }
    private calculateDate(timeFrame: string) {
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

}

export default ProcStat;