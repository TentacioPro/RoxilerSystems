import React, { useState, useEffect } from'react';
import axios from 'axios';

const Statistics = () => {
  const [month, setMonth] = useState('March');
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchStatistics();
  }, [month]);

  const fetchStatistics = async () => {
    const response = await axios.get('/statistics', {
      params: { month }
    });
    setStatistics(response.data);
  };

  return (
    <div>
      <h2>Statistics</h2>
      <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
      <p>Total Sold Items: {statistics.totalSoldItems}</p>
      <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
    </div>
  );
};

export default Statistics;