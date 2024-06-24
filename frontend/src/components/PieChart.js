import React, { useState, useEffect } from'react';
import axios from 'axios';
import { PieChart, Pie, Sector, Cell } from'recharts';

const PieChartComponent = () => {
  const [month, setMonth] = useState('March');
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchPieChart();
  }, [month]);

  const fetchPieChart = async () => {
    const response = await axios.get('/pie-chart', {
      params: { month }
    });
    setData(response.data);
  };

  return (
    <PieChart width={500} height={300}>
      <Pie dataKey="count" data={data} cx={200} cy={200} outerRadius={100} fill="#8884d8" />
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.category} />
      ))}
    </PieChart>
  );
};

export default PieChartComponent;