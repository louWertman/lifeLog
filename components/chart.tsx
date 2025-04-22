import React, { useEffect, useState, PureComponent, useMemo } from 'react';
import { FileSystem } from '../app/lib/dataManagement';
import { Habit, Entry } from '../app/lib/entity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface chartProps {
    data: any[];
}

export const Chart: React.FC<chartProps> = ({ data }) => {
    const [chartData, setChartData] = useState<any[]>([]);
    useEffect(() => {
        if (data && data.length > 0) {
            setChartData(data);
        }
    }, [data]);


    if (!data || data.length === 0) {
        return <div>Not enough data! Use lifeLog more or maybe there is not enough information on this particular habit</div>;
    }

    return (
        <BarChart
            width={800}
            height={400}
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number"/>
            <YAxis type="category" dataKey="mood" />
            <Tooltip />
            <Legend />

            <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
    );
}