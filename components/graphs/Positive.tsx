/*
For tracking the Positive habits over time
*/

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Export from '../Export';


interface positiveChartProps {
    data: any[];
}

export const PositiveChart: React.FC<positiveChartProps> = ({ data }) => {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (data && data.length > 0) {
            setChartData(data);
        }
    }, [data]);

    if (!data || data.length === 0) {
        return <div>Make sure you have some positive habits, or trying to enageg in them</div>;
    }

    return (
        <div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={false}/>
                    <YAxis />
                    <Tooltip 
                        contentStyle={{ backgroundColor: "#24292f", color: "white", border: "none" }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Positive Habits" strokeWidth={3}/>
                </LineChart>
            </ResponsiveContainer>
            <Export
                data={data}
            />
        </div>
    );
};