/*
For Consistency Graph
*/

import React, { useEffect, useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import Export from '../Export';


interface consistencyChartProps {
    data: any[];
}

export const ConsistencyChart: React.FC<consistencyChartProps> = ({ data }) => {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (data && data.length > 0) {
            setChartData(data);
        }
    }, [data]);

    if (!data || data.length === 0) {
        return <div>Make sure you have negative habits - or perhaps you haven't engaged with them in a while. In the latter keep doing what you are doing!</div>;
    }

    return (
        <div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={false} />
                    <YAxis />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#24292f", color: "white", border: "none" }}
                    />
                    <Line type="monotone" dataKey="length" stroke="#8884d8" name="Charecter Count" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
            <Export
                data={data}
            />
        </div>
    );
};