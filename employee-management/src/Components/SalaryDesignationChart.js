import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57'];

function DesignationSalaryChart() {
  const [employeeData, setEmployeeData] = useState([]);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    axios.get('https://localhost:7295/api/employee')
      .then(res => {
        const data = res.data;
        const group = {};

        data.forEach(emp => {
          const desig = emp.Designation || 'Unknown';
          group[desig] = (group[desig] || 0) + (parseFloat(emp.Salary) || 0);
        });

        const chartData = Object.keys(group).map(designation => ({
          designation,
          salary: group[designation],
        }));

        setEmployeeData(chartData);
      })
      .catch(err => console.error('Chart data fetch error:', err));
  }, []);

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="salary"
                data={employeeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {employeeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="designation" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="salary" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="designation" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="salary" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Salary by Designation</h3>
      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={(e, newType) => newType && setChartType(newType)}
        style={{ marginBottom: '20px' }}
      >
        <ToggleButton value="bar">Bar</ToggleButton>
        <ToggleButton value="line">Line</ToggleButton>
        <ToggleButton value="pie">Pie</ToggleButton>
      </ToggleButtonGroup>
      {renderChart()}
    </div>
  );
}

export default DesignationSalaryChart;
