import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit } from '../app/lib/entity';




const EditorHabit: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
    const [habitName, setHabitName] = useState<string>("");
    const [active, setActive] = useState<boolean>(true);
    const [positive, setPositive] = useState<boolean>(true);

    const fs = new FileSystem();

    useEffect(() => {
        const fetchHabits = async () => {
            const habitList = await fs.listAllHabits();
            setHabits(habitList);
        };

        fetchHabits();
    }, []);

    const saveHabit = async () => {
        if (habitName === "") {
            alert("Habit must have name");
            return;
        }
        await fs.habitControl(habitName, positive, active);
        RESET();
    };

    const deleteHabit = async (habit: Habit) => {
        if (window.confirm(`Are you sure you want to delete the habit?`)) {
            await fs.removehabit(habit.name);
            updateHabitList();
            RESET();
        }
    };

    const updateHabitList = async () => {
        const updatedHabitList = await fs.listAllHabits();
        setHabits(updatedHabitList);
    };

    const editHabit = (habit: Habit) => {
        setSelectedHabit(habit);
        setHabitName(habit.name);
        setActive(habit.active);
        setPositive(habit.positive);
        return habit;
    };

    const RESET = () => {
        setHabitName("");
        setActive(true);
        setPositive(true);
        setSelectedHabit(null);
        updateHabitList();
    };

    return (
        <div className='habit-editor'>
            <h2>Habit Editor</h2>
            Here you can set up the Habits. A default list will always be generated. The attributes of the habits are:
            <br />
            <ul>
                {/* this could be improved by being a popup or having the headers be hovered for more info */}
                <li>Habit Name</li>
                <li>Active: Is this a habit you are engaged in? If not you can keep it for statistics processing, but otherwise you will not see it for entries </li>
                <li>Positive: Is this a positive habit or one you wish to quit?</li>
            </ul>
            <br/>
            <i>Note: Deleting a habit will remove from your entries, do not do unless you are certain.</i>
            <br />
            <br />
            <div>
                {/* <h3>{selectedHabit ? "Edit Habit" : "Add Habit"}</h3> */}
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Active?</th>
                            <th>Positive?</th>
                        </tr>
                    </thead>
                    <tbody>

                        {habits.map((habit, index) => (
                            <tr key={index}>
                                <th>{habit.name}</th>
                                <th>{habit.active}</th>
                                <th>{habit.positive}</th>
                                <th><button
                                    className="habit button"
                                    onClick={() => editHabit(habit)}>Edit</button></th>
                                <th><button 
                                className="habit button"
                                onClick={() => deleteHabit(habit)}>Delete</button></th>
                            </tr>
                        ))}
                        {/* editor */}
                        <tr>
                            <th>
                                <input
                                    type="text"
                                    value={habitName}
                                    disabled={(selectedHabit !== null)}
                                    onChange={(e) => setHabitName(e.target.value)}
                                />
                            </th>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={(e) => setActive(e.target.checked)}
                                />
                            </th>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={positive}
                                    onChange={(e) => setPositive(e.target.checked)}
                                />
                            </th>
                            <th>
                                <button 
                                className="habit button"
                                onClick={saveHabit}>
                                    {selectedHabit ? "Save Changes" : "Add Habit"}
                                </button>
                            </th>
                        </tr>
                    </tbody>
                </table>
                <br />
            </div>
        </div>
    );
};

export default EditorHabit;