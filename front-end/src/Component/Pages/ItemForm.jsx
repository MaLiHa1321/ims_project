import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ItemForm = ({ inventoryId: propInventoryId, itemId, onSave }) => {
  const { id: routeId } = useParams();
  const inventoryId = propInventoryId || routeId;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState(null);
  const [item, setItem] = useState({
    title: '',
    description: '',
    quantity: 0,
    version: 0,
    textFields: [],
    textareaFields: [],
    numberFields: [],
    booleanFields: [],
    documentFields: [],
  });

  useEffect(() => {
    if (!inventoryId) {
      setError('Inventory ID is required');
      return;
    }
    fetchInventory();
    if (itemId) fetchItem();
    // eslint-disable-next-line
  }, [inventoryId, itemId]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/inventories/${inventoryId}`, config);
      setInventory(res.data);
    } catch (err) {
      setError('Failed to load inventory');
    }
  };

  const fetchItem = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/items/${itemId}`, config);

      // Map backend data into local state
      setItem({
        title: res.data.title || '',
        description: res.data.description || '',
        quantity: res.data.quantity || 0,
        version: res.data.version || 0,
        textFields: res.data.textFields || [],
        textareaFields: res.data.textareaFields || [],
        numberFields: res.data.numberFields || [],
        booleanFields: res.data.booleanFields || [],
        documentFields: res.data.documentFields || [],
      });
    } catch (err) {
      setError('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

      // Prepare payload differently for create (POST) vs update (PUT)
      let payload;
      if (itemId) {
        payload = {
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          version: item.version,
          textFields: item.textFields,
          textareaFields: item.textareaFields,
          numberFields: item.numberFields,
          booleanFields: item.booleanFields,
          documentFields: item.documentFields,
        };
      } else {
        payload = {
          inventory: inventoryId,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
        };
      }

      const res = itemId
        ? await axios.put(`http://localhost:5000/api/items/${itemId}`, payload, config)
        : await axios.post(`http://localhost:5000/api/items`, payload, config);

      if (onSave) onSave(res.data);
      else navigate(`/inventories/${inventoryId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
  if (!inventory) return <Alert variant="warning">Inventory not found</Alert>;

  return (
    <Card>
      <Card.Header>
        <h3>{itemId ? 'Edit Item' : 'Add New Item'}</h3>
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

          {/* You can add dynamic field editors here if needed */}
          {/* Example for textFields */}
          {inventory.fields?.filter(f => f.type === 'text').map(field => {
            const value = item.textFields.find(fv => fv.fieldId === field._id)?.value || '';
            return (
              <Form.Group className="mb-3" key={field._id}>
                <Form.Label>{field.title}</Form.Label>
                <Form.Control
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const newFields = [...item.textFields];
                    const idx = newFields.findIndex(fv => fv.fieldId === field._id);
                    if (idx >= 0) newFields[idx].value = e.target.value;
                    else newFields.push({ fieldId: field._id, value: e.target.value });
                    setItem({ ...item, textFields: newFields });
                  }}
                />
              </Form.Group>
            );
          })}

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : itemId ? 'Update Item' : 'Create Item'}
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
