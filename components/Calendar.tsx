'use client'

import React, { useState } from 'react';
import '../app/css/entry.module.css';
import {Entry, Habit} from '../app/lib/entity'; // Ensure the file name matches the actual file in your project
import {FileSystem} from '../app/lib/dataManagement';
import EditEntry from './EditEntry';

const Calendar = ({ onDateClick }: { onDateClick: (date: Date) => void }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const selectDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        let stringDate = selectDate.toLocaleString('en-ET').split(",")[0];
        setSelectedDate(stringDate);

    };

    const handleSave = async (content: string, date: string,
        habitNames: string[], mood: string): Promise<void> => {
        let fileSystem = new FileSystem();
        let habitList = await fileSystem.listHabits();
        let habitsForEntry: Habit[] = [];

        habitList.forEach(habitInList => {
            habitNames.forEach(habitName => {
                if (habitInList.name === habitName) {
                    habitsForEntry.push(habitInList);
                }
            });
        });

        console.log("HABITS FOR ENTRY: ", habitsForEntry);

        let entry = new Entry(
            date,
            mood,
            habitsForEntry,
            content
        );

        await fileSystem.saveEntry(entry);
    };


    const renderDaysOfWeek = () => {
        const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return daysOfWeek.map((day, index) => (
            <div key={index} className="calendar-day-header">
                {day}
            </div>
        ));
    };

    const renderDays = () => {
        const days = [];
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateClick(day)}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button onClick={handlePrevMonth}>◀</button>
                <select
                    value={currentDate.getMonth()}
                    onChange={(e) =>
                        setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))
                    }
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <span>{currentDate.getFullYear()}</span>
                <button onClick={handleNextMonth}>▶</button>
            </div>
            <div className="calendar-grid">
                <div className="calendar-days-of-week">{renderDaysOfWeek()}</div>
                <div className="calendar-dates">{renderDays()}</div>
            </div>
            
        </div>
    );
};

export default Calendar;