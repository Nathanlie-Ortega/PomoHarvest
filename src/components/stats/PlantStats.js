// src/components/stats/PlantStats.js
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '../ui/Card';
import Loading from '../ui/Loading';

const PlantStats = ({ plants, isLoading }) => {
  const [pieData, setPieData] = useState([]);
  const [plantCounts, setPlantCounts] = useState({});
  const [totalPlants, setTotalPlants] = useState(0);
  
  useEffect(() => {
    if (plants && plants.length > 0) {
      // Count plants by type
      const counts = {};
      plants.forEach(plant => {
        counts[plant.type] = (counts[plant.type] || 0) + 1;
      });
      
      // Format data for pie chart
      const data = Object.entries(counts).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize plant type
        value: count,
        emoji: getPlantEmoji(type)
      }));
      
      setPieData(data);
      setPlantCounts(counts);
      setTotalPlants(plants.length);
    }
  }, [plants]);
  
  // Helper function to get plant emoji
  const getPlantEmoji = (type) => {
    const plantEmojis = {
      carrot: '🥕',
      tomato: '🍅',
      wheat: '🌾',
      corn: '🌽',
      potato: '🥔',
      strawberry: '🍓',
      lettuce: '🥬',
      eggplant: '🍆',
    };
    
    return plantEmojis[type] || '🌱';
  };
  
  // Colors for the pie chart
  const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6', '#84CC16'];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {data.emoji} {data.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{data.value}</span> plants
            ({Math.round((data.value / totalPlants) * 100)}%)
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Custom legend
  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-wrap justify-center mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center mr-4 mb-2">
            <div 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {entry.payload.emoji} {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };
  
  if (isLoading) {
    return <Loading message="Analyzing plant data..." />;
  }
  
  if (!plants || plants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🌱</div>
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No plants yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Complete focus sessions to grow plants!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Plant Distribution" padding="normal">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <Card title="Plant Collection" padding="normal">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {pieData.map((plant, index) => (
            <div 
              key={index}
              className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center"
            >
              <div className="text-3xl mb-2">{plant.emoji}</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{plant.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {plant.value} plants ({Math.round((plant.value / totalPlants) * 100)}%)
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card title="Harvesting Activity" padding="normal">
        <div className="space-y-2">
          {/* Monthly activity summary */}
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">This Month</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {plants.filter(p => {
                const now = new Date();
                const plantDate = new Date(p.harvestedAt);
                return plantDate.getMonth() === now.getMonth() && 
                       plantDate.getFullYear() === now.getFullYear();
              }).length} plants
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">This Week</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {plants.filter(p => {
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                
                const plantDate = new Date(p.harvestedAt);
                return plantDate >= startOfWeek;
              }).length} plants
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Today</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {plants.filter(p => {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const plantDate = new Date(p.harvestedAt);
                const plantDay = new Date(plantDate.getFullYear(), plantDate.getMonth(), plantDate.getDate());
                return plantDay.getTime() === today.getTime();
              }).length} plants
            </span>
          </div>
          
          <div className="flex justify-between py-2">
            <span className="text-gray-500 dark:text-gray-400">Total Focus Time</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.floor(plants.reduce((sum, p) => sum + (p.focusLength || 0), 0) / 60)}h {plants.reduce((sum, p) => sum + (p.focusLength || 0), 0) % 60}m
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlantStats;
