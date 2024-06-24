import React from'react';
import TransactionsTable from './components/TransactionTable.js';
import Statistics from './components/Statistics.js';
import BarChartComponent from './components/BarChart.js';
import PieChartComponent from './components/PieChart.js';

const App = () => {
  return (
    <div>
      <TransactionsTable />
      <Statistics />
      <BarChartComponent />
      <PieChartComponent />
    </div>
  );
};

export default App;