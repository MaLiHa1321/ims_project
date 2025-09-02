import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const CustomIdBuilder = ({ inventoryId, customIdFormat, onChange }) => {
  const [elements, setElements] = useState(customIdFormat || []);
  const [error, setError] = useState('');

  useEffect(() => {
    setElements(customIdFormat || []);
  }, [customIdFormat]);

  const handleAddElement = () => {
    const newElement = { type: 'fixed', value: '', format: '', order: elements.length };
    const updated = [...elements, newElement];
    setElements(updated);
    onChange(updated);
  };

  const handleRemoveElement = (index) => {
    const updated = elements.filter((_, i) => i !== index).map((el, i) => ({ ...el, order: i }));
    setElements(updated);
    onChange(updated);
  };

  const handleChange = (index, key, value) => {
    const updated = elements.map((el, i) => i === index ? { ...el, [key]: value } : el);
    setElements(updated);
    onChange(updated);
  };

  const handleSave = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
     await axios.put(
  `http://localhost:5000/api/inventories/${inventoryId}`,
  { customIdFormat: elements, version: inventoryVersion },
  {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

      );
      alert('Custom ID format saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save custom ID format');
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}

      <Button variant="success" onClick={handleAddElement} className="mb-3">
        Add Element
      </Button>

      {elements.length === 0 && <p>No elements yet</p>}

      {elements.length > 0 && (
        <Table bordered hover>
          <thead>
            <tr>
              <th>Order</th>
              <th>Type</th>
              <th>Value / Format</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {elements.map((el, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <Form.Select
                    value={el.type}
                    onChange={(e) => handleChange(idx, 'type', e.target.value)}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="random20">Random 20</option>
                    <option value="random32">Random 32</option>
                    <option value="random6">Random 6</option>
                    <option value="random9">Random 9</option>
                    <option value="guid">GUID</option>
                    <option value="datetime">Datetime</option>
                    <option value="sequence">Sequence</option>
                  </Form.Select>
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={el.type === 'fixed' || el.type === 'sequence' ? el.value || el.format : el.value}
                    placeholder="Value or format"
                    onChange={(e) => handleChange(idx, el.type === 'sequence' ? 'format' : 'value', e.target.value)}
                  />
                </td>
                <td>
                  <Button variant="danger" onClick={() => handleRemoveElement(idx)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Button variant="primary" onClick={handleSave}>
        Save Custom ID Format
      </Button>
    </div>
  );
};

export default CustomIdBuilder;
