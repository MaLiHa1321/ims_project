import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ItemForm = ({ inventoryId: propInventoryId, onSave }) => {
  const { id: routeId } = useParams();
  const inventoryId = propInventoryId || routeId;

  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState(null);
  const [item, setItem] = useState({
    title: '',
    description: '',
    quantity: 0,
  });

  useEffect(() => {
    if (!inventoryId) {
      setError('Inventory ID is required');
      return;
    }
    fetchInventory();
  
  }, [inventoryId]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `https://ims-project-server.onrender.com/api/inventories/${inventoryId}`,
        config
      );
      setInventory(res.data);
    } catch (err) {
      setError('Failed to load inventory');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      };

      const payload = {
        inventory: inventoryId,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
      };

      const res = await axios.post(
        `https://ims-project-server.onrender.com/api/items`,
        payload,
        config
      );

      if (onSave) onSave(res.data);
      else navigate(`/inventories/${inventoryId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  if (!inventory) return <Alert variant="warning">Inventory not found</Alert>;

  return (
    <Card>
      <Card.Header>
        <h3>Add New Item</h3>
        <p className="text-muted mb-0">Inventory: {inventory?.title || 'Loading...'}</p>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Item Title *</Form.Label>
            <Form.Control
              type="text"
              value={item.title}
              onChange={(e) => setItem({ ...item, title: e.target.value })}
              required
              placeholder="Enter item title"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={item.description}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
              placeholder="Enter description (optional)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={item.quantity}
              onChange={(e) =>
                setItem({ ...item, quantity: parseInt(e.target.value, 10) || 0 })
              }
              min="0"
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create Item'}
            </Button>
            <Button variant="secondary" as={Link} to={`/inventories/${inventoryId}`}>
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ItemForm;
