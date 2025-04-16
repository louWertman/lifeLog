import React, { useEffect, useState, PureComponent } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit, Entry } from '../app/lib/entity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface chartProps {
    allHabits: string[];
    allMoods: string[];
    selectedHabit: string | null;
    selectedMood: string | null;
    //add filesystem methods to count the occurence.
}

export const Chart: React.FC<chartProps> = ({ allHabits, allMoods, selectedHabit, selectedMood }) => {
    
    return(
        ''
    );
}