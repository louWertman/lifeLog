'use client'

import React, { useEffect, useState } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit } from '../app/lib/entity';

interface HabitsProps {
  selectedHabits: string[]; // Array of currently selected habits
  setSelectedHabits: (habits: string[]) => void;
}

const Habits: React.FC<HabitsProps> = ({ selectedHabits, setSelectedHabits }) => {
  const [habitList, setHabitOptions] = useState<string[]>([]); // All Active habits, no inactive ones
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  let fileSystem = new FileSystem();

  // Fetch habits from the FileSystem class when the component mounts
  useEffect(() => {
    const fetchHabits = async () => {
        let habitsList = await fileSystem.listHabits(); 
        const habitNames = habitsList.map((habit) => habit.name);
        setHabitOptions(habitNames); 
    };

    fetchHabits();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Habit Selection
  const handleHabitChange = (habit: string) => {
    if (selectedHabits.includes(habit)) {

      // Remove habit if selected
      setSelectedHabits(selectedHabits.filter((h) => h !== habit));
    } else {

      // Add habit if not selected
      setSelectedHabits(selectedHabits.concat(habit));
    }
  };

  return (
    <div>
      <button className="habit button" type="button" onClick={toggleDropdown}>
        Select Habits
      </button>
      {isDropdownOpen && (
        <div className="scrollable-menu">
          {habitList.map((habit, index) => (
            <label key={index} className="habit-item">
              <input
                type="checkbox"
                checked={selectedHabits.includes(habit)}
                onChange={() => handleHabitChange(habit)}
              />
              {habit}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Habits;