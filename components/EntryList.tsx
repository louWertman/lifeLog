import React from 'react';
import Entry from "../components/entry"; // Import the Entry component

let entries = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Entry ${i + 1}`,
  content: `Content for entry ${i + 1}`,
  date: `2023-10-${String(i + 1).padStart(2, '0')}`
}));

const EntryList: React.FC = () => {
  return (
    <div>
      {entries.map((entry) => (
        <Entry key={entry.id} title={entry.title} body={entry.content} date={entry.date} />
      ))}
    </div>
  );
};



export default EntryList;
