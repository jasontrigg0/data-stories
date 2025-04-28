import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import data from './approval.json';

// Format date to be more readable
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

const ApprovalRatingChart = () => {
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [zoomedData, setZoomedData] = useState(data);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const onMouseDown = (e) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setRefAreaRight('');
    }
  };

  const onMouseMove = (e) => {
    if (refAreaLeft && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };
  
  const onMouseUp = () => {
    if (refAreaLeft && refAreaRight) {
      // If they're the same point, don't zoom
      if (refAreaLeft === refAreaRight) {
        setRefAreaLeft('');
        setRefAreaRight('');
        return;
      }
      
      // Make sure left < right
      let indexLeft = data.findIndex(d => d.date === refAreaLeft);
      let indexRight = data.findIndex(d => d.date === refAreaRight);
      
      if (indexLeft > indexRight) {
        [indexLeft, indexRight] = [indexRight, indexLeft];
      }
      
      // Create new zoomed data array
      const newZoomedData = data.slice(indexLeft, indexRight + 1);
      setZoomedData(newZoomedData);
      setIsZoomed(true);
      
      // Clear reference areas
      setRefAreaLeft('');
      setRefAreaRight('');
    }
  };

  // Reset zoom level
  const resetZoom = () => {
    setZoomedData(data);
    setIsZoomed(false);
  };
  
  // Determine visible ticks based on data range
  const getTicksArray = () => {
    const dataToUse = isZoomed ? zoomedData : data;
    
    // If showing a smaller range, we can show more ticks
    if (isZoomed && zoomedData.length < 30) {
      // For very small ranges, show more ticks
      const step = Math.max(1, Math.floor(zoomedData.length / 10));
      const ticks = [];
      
      for (let i = 0; i < dataToUse.length; i += step) {
        ticks.push(dataToUse[i].date);
      }
      
      // Make sure we include the last date
      if (ticks[ticks.length - 1] !== dataToUse[dataToUse.length - 1].date) {
        ticks.push(dataToUse[dataToUse.length - 1].date);
      }
      
      return ticks;
    }
    
    // If showing all or many data points, pick evenly spaced dates
    const step = Math.ceil(dataToUse.length / 8);
    const ticks = [];
    
    for (let i = 0; i < dataToUse.length; i += step) {
      ticks.push(dataToUse[i].date);
    }
    
    // Make sure we include the last date
    if (ticks[ticks.length - 1] !== dataToUse[dataToUse.length - 1].date) {
      ticks.push(dataToUse[dataToUse.length - 1].date);
    }
    
    return ticks;
  };

  return (
    <div className="w-full h-120 p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Daily Approval Rating Tracker</h2>
        {isZoomed && (
          <button 
            onClick={resetZoom}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Reset Zoom
          </button>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-6">
        Polling data from <a href="https://www.natesilver.net/p/trump-approval-ratings-nate-silver-bulletin">Nate Silver</a>. {isZoomed 
          ? 'Drag to zoom in further. Click Reset to view all data.' 
          : 'Drag across the chart to zoom in on a specific time period.'
        }
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={isZoomed ? zoomedData : data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 30
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            type="category"
            ticks={getTicksArray()}
          />
          <YAxis 
            domain={[40, 55]} 
            tickCount={7} 
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, payload) => `${value}%`}
            labelFormatter={formatDate}
            isAnimationActive={false}
          />
          <Legend 
            verticalAlign="bottom" 
            height={50}
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Line
            type="monotone"
            dataKey="approve"
            name="Approve"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="disapprove"
            name="Disapprove"
            stroke="#F44336"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
          {refAreaLeft && refAreaRight && (
            <ReferenceArea 
              x1={refAreaLeft} 
              x2={refAreaRight} 
              strokeOpacity={0.3}
              fill="#8884d8" 
              fillOpacity={0.3} 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ paddingTop: '20px' }}>
        Note that values are somewhat less favorable to Trump vs the Silver Bulletin tracker. One possible factor is that this tries to estimate the all adults approval rating, which seems to be about 1.5% less favorable on average compared to registered voters or likely voters. Another possibility is that this is more forward-looking: the Silver Bulletin weights older polls from high-quality pollsters heavily versus I believe this average is more weighted to the latest polling results.
      </div>
    </div>
  );
};

export default ApprovalRatingChart;