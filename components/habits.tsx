'use client'

import React, { useEffect, useState, useRef } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit } from '../app/lib/entity';

interface HabitsProps {
  selectedHabits: string[]; // Array of currently selected habits
  setSelectedHabits: (habits: string[]) => void;
}

const Habits: React.FC<HabitsProps> = ({ selectedHabits, setSelectedHabits }) => {
  const [habitList, setHabitOptions] = useState<string[]>([]); // Grab active Habits
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const habitDDRef = useRef<HTMLDivElement>(null);
  let fileSystem = new FileSystem();

  // Fetch habits from the FileSystem class when the component mounts
  useEffect(() => {
    const fetchHabits = async () => {
        let habitsList = await fileSystem.listHabits(); 
        const habitNames = habitsList.map((habit) => habit.name);
        setHabitOptions(habitNames); 
    };

    const clickOutsite = (event: MouseEvent) => {
      if (habitDDRef.current && !habitDDRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }



    fetchHabits();
    document.addEventListener("mousedown", clickOutsite);
    return () => {
      document.removeEventListener("mousedown", clickOutsite);
    }
  }, [fileSystem]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Habit Selection
  const handleHabitChange = (habit: string) => {
    if (selectedHabits.includes(habit)) {

      // Remove habit if selected
      setSelectedHabits(selectedHabits.filter((h) => h !== habit));
    } else {

      setSelectedHabits(selectedHabits.concat(habit));
    }
  };

  return (
    <div>
      <button className="habit button" type="button" onClick={toggleDropdown}>
        Select Habits
      </button>
      {isDropdownOpen && (
        <div ref={habitDDRef} className="scrollable-menu">
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