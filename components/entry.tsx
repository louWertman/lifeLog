'use client'

import React from 'react';
import '../app/css/entry.module.css';

interface EntryProps {
    date: string;
}

const EntryV: React.FC<EntryProps> = ({ date }) => {
    
    
    
    return (
        <div >
            <h1>{date}</h1>
            {/* <h2>{mood}</h2>
            <h3>{habits}</h3>
            <p>{content}</p> */}
        </div>
    );
};

export default EntryV;