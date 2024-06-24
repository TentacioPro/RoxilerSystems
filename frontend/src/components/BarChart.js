import React, { useState, useEffect } from'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from'recharts';

const BarChartComponent = () => {
  const [month, setMonth] = useState('March');
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBarChart();
  }, [month]);

  const fetchBarChart = async () => {
    const response = await axios.get('/bar-chart', {
      params: { month }
    });
    setData(response.data);
  };

  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="label" />
      <YAxis />
      <CartesianGrid stroke="#ccc" />
      <Tooltip />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );
};

export default BarChartComponent;