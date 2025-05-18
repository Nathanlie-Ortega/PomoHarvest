// src/components/stats/FocusChart.js (continued)
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const FocusChart = ({ plants }) => {
  const [chartData, setChartData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(6); // Default to latest day (today)
  
  useEffect(() => {
    // Process plants data for the chart
    const processChartData = () => {
      // Create data for the last 7 days
      const result = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayPlants = plants.filter(plant => {
          const plantDate = new Date(plant.harvestedAt);
          plantDate.setHours(0, 0, 0, 0);
          return plantDate.getTime() === date.getTime();
        });
        
        result.push({
          name: dateString,
          sessions: dayPlants.length,
          minutes: dayPlants.reduce((sum, plant) => sum + (plant.focusLength || 0), 0),
          date: date
        });
      }
      
      setChartData(result);
    };
    
    if (plants && plants.length > 0) {
      processChartData();
    }
  }, [plants]);
  
  const handleBarClick = (data, index) => {
    setActiveIndex(index);
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            <span className="font-medium">{payload[0].value}</span> sessions
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{payload[1].value}</span> minutes
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barSize={36}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis 
          yAxisId="left"
          orientation="left"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => value}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}m`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          yAxisId="left"
          dataKey="sessions" 
          fill="#4ADE80" 
          radius={[4, 4, 0, 0]}
          onClick={handleBarClick}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={index === activeIndex ? '#22C55E' : '#4ADE80'} 
              fillOpacity={index === activeIndex ? 1 : 0.8}
            />
          ))}
        </Bar>
        <Bar 
          yAxisId="right"
          dataKey="minutes" 
          fill="#60A5FA" 
          radius={[4, 4, 0, 0]}
          onClick={handleBarClick}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={index === activeIndex ? '#3B82F6' : '#60A5FA'} 
              fillOpacity={index === activeIndex ? 1 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FocusChart;