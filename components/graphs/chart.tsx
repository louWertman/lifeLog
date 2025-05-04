import React, { useEffect, useState, PureComponent, useMemo } from 'react';
import { FileSystem } from '../../app/lib/dataManagement';
import { Habit, Entry } from '../../app/lib/entity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Export from '../Export';

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
        return <div>Select a Habit!</div>;
    }

    return (
        <div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    width={75}
                    height={100}
                    data={data}
                    barSize={180}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="mood" tick={{ fontSize: 12, fontWeight: 'bold' }}/>
                    <Tooltip
                        contentStyle={{ backgroundColor: "#24292f", color: "white", border: "none" }}
                    />
                    <Legend />

                    <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
            <Export
                data={data}
            />
        </div>
    );
}