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
    };

    const RESET = () => {
        setHabitName("");
        setActive(true);
        setPositive(true);
        setSelectedHabit(null);
        updateHabitList();
    };

    return (
        <div>
            <h2>Habit Edit</h2>
            Here you can set up the Habits. A default list will always be generated. The attributes of the habits are:
            <br />
            <ul>
                <li>Habit Name</li>
                <li>Active: Is this a habit you are engaged in? If not you can keep it for statistics processing, but otherwise you will not see it for entries </li>
                <li>Positive: Is this a positive habit or one you wish to quit?</li>

            NOTE: Deleting a habit will remove from your entries, do not do unless you are certain.
            </ul>
            <div>
                <h3>Current Habits</h3>
                {habits.length === 0 ? (
                    <p>No habits  - default list should load refresh and check for web browser file system errors.</p>
                ) : (
                    <ul>
                        {habits.map((habit, index) => (
                            <li key={index} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                                <span style={{ flex: 1 }}>{habit.name}</span>
                                <button onClick={() => editHabit(habit)}>Edit</button>
                                <button onClick={() => deleteHabit(habit)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h3>{selectedHabit ? "Edit Habit" : "Add Habit"}</h3>
                <label>
                    Name:
                    <input
                        type="text"
                        value={habitName}
                        onChange={(e) => setHabitName(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Active:
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                    />
                </label>
                <br />
                <label>
                    Positive:
                    <input
                        type="checkbox"
                        checked={positive}
                        onChange={(e) => setPositive(e.target.checked)}
                    />
                </label>
                <br />
                <button onClick={saveHabit} style={{ marginTop: "10px" }}>
                    {selectedHabit ? "Save Changes" : "Add Habit"}
                </button>
            </div>
        </div>
    );
};

export default EditorHabit;