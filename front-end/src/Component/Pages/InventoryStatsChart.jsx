// frontend/src/components/InventoryStatsChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from 'react-bootstrap';

const InventoryStatsChart = ({ stats }) => {
  if (!stats) return null;

  // Example: prepare numeric fields for bar chart
  const numericData = Object.values(stats.fieldStats.number || {}).map(f => ({
    field: f.field,
    sum: f.sum,
    average: f.average,
    min: f.min,
    max: f.max
  }));

  if (numericData.length === 0) return <p className="text-muted">No numeric fields to display</p>;

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Numeric Fields Stats</h5>
      </Card.Header>
      <Card.Body style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={numericData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="field" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sum" fill="#8884d8" />
            <Bar dataKey="average" fill="#82ca9d" />
            <Bar dataKey="min" fill="#ffc658" />
            <Bar dataKey="max" fill="#ff8042" />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default InventoryStatsChart;
