
// App.js
import React, { useState, useEffect } from 'react';
import Dropdown from './components/Dropdown';
import PieChart from './components/PieChart';
import TimeSeriesChart from './components/TimeSeriesChart';

const defaultSpendingData = [
  { department: 'Defense', year: 2022, amount: 750 },
  { department: 'Education', year: 2022, amount: 150 },
  { department: 'Healthcare', year: 2022, amount: 200 },
  { department: 'Defense', year: 2023, amount: 780 },
  { department: 'Education', year: 2023, amount: 160 },
  { department: 'Healthcare', year: 2023, amount: 210 },
  { department: 'Transportation', year: 2022, amount: 100 },
  { department: 'Transportation', year: 2023, amount: 110 },
];


function App() {
  const [spendingData, setSpendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`api/spending`);
        if (!response.ok) throw new Error('Failed to fetch data');
        console.log('response:', await response.text());
        const data = await response.json();  // Fixed: Removed console.log and separate response.json() call
        setSpendingData(data);
      } catch (error) {
        console.error('Failed to fetch spending data:', error);
        setSpendingData(defaultSpendingData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data with useMemo before any conditional returns
  const processedData = React.useMemo(() => {
    if (!spendingData.length) {
      return {
        availableYears: [],
        availableDepartments: [],
        pieChartData: [],
        timeSeriesData: []
      };
    }
    const availableYears = processData.getUniqueValues(spendingData, 'year');
    const availableDepartments = processData.getUniqueValues(spendingData, 'department');
    
    const filteredData = processData.filterData(spendingData, {
      year: selectedYear,
      department: selectedDepartment
    });
    
    const departmentTotals = processData.calculateDepartmentTotals(filteredData);
    const pieChartData = processData.preparePieChartData(departmentTotals);
    const timeSeriesData = processData.prepareTimeSeriesData(spendingData, availableDepartments);

    return {
      availableYears,
      availableDepartments,
      pieChartData,
      timeSeriesData
    };
  }, [spendingData, selectedYear, selectedDepartment]);

  if (loading) {
    return <div>Loading spending data...</div>;
  }

  return (
    <div className="App">
      <h1>Government Spending Dashboard</h1>
      
      <FilterControls
        years={processedData.availableYears}
        departments={processedData.availableDepartments}
        selectedYear={selectedYear}
        selectedDepartment={selectedDepartment}
        onYearChange={(e) => setSelectedYear(e.target.value)}
        onDepartmentChange={(e) => setSelectedDepartment(e.target.value)}
      />

      <h2>Spending by Department</h2>
      {processedData.pieChartData.length > 0 ? (
        <PieChart data={processedData.pieChartData} />
      ) : (
        <p>No data available for the selected filters.</p>
      )}

      <h2>Spending Over Time</h2>
      {processedData.timeSeriesData.map((series) => (
        <TimeSeriesChart
          key={series.department}
          data={series.data}
          title={series.department}
        />
      ))}
    </div>
  );
}

// Components and utilities remain the same...
const FilterControls = ({ years, departments, selectedYear, selectedDepartment, onYearChange, onDepartmentChange }) => (
  <div className="filters">
    <Dropdown
      label="Year"
      options={years}
      value={selectedYear}
      onChange={onYearChange}
    />
    <Dropdown
      label="Department"
      options={departments}
      value={selectedDepartment}
      onChange={onDepartmentChange}
    />
  </div>
);

const processData = {
  getUniqueValues: (data, key) => [...new Set(data.map(item => item[key]))],
  
  filterData: (data, { year, department }) => {
    return data.filter(item => {
      const yearMatch = !year || item.year.toString() === year;
      const departmentMatch = !department || item.department === department;
      return yearMatch && departmentMatch;
    });
  },
  
  calculateDepartmentTotals: (data) => {
    return data.reduce((acc, item) => {
      acc[item.department] = (acc[item.department] || 0) + item.amount;
      return acc;
    }, {});
  },
  
  preparePieChartData: (totals) => {
    return Object.entries(totals).map(([department, amount]) => ({
      label: department,
      value: amount
    }));
  },
  
  prepareTimeSeriesData: (data, departments) => {
    return departments.map(department => ({
      department,
      data: data
        .filter(item => item.department === department)
        .sort((a, b) => a.year - b.year)
        .map(item => ({
          year: String(item.year),
          amount: item.amount
        }))
    }));
  }
};

export default App;