import React from 'react';

interface EntryProps {
    title: string;
    body: string;
    date: string;
}

const Entry: React.FC<EntryProps> = ({ title, body, date }) => {
    return (
        <div >
            <h1>{title}</h1>
            <small>{date}</small>
            <p>{body}</p>
        </div>
    );
};

export default Entry;