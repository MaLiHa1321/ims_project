// frontend/src/components/ItemDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Spinner, Alert, Button, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';

const ItemDetail = () => {
  const { inventoryId, itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch item and inventory
  useEffect(() => {
    fetchItem();
    fetchInventory();
    // eslint-disable-next-line
  }, [inventoryId, itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`https://ims-project-server.onrender.com/api/items/${itemId}`, config);
      setItem(res.data);
    } catch (err) {
      console.error('Error fetching item:', err);
      setError('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`https://ims-project-server.onrender.com/api/inventories/${inventoryId}`, config);
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`https://ims-project-server.onrender.com/api/items/${itemId}`, config);
      navigate(`/inventories/${inventoryId}`);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const getFieldValue = (fieldType, fieldId) => {
    const fieldArray = `${fieldType}Fields`;
    const field = item?.[fieldArray]?.find(
      f => f.fieldId && f.fieldId.toString() === fieldId.toString()
    );
    return field ? field.value : null;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!item) {
    return <Alert variant="warning">Item not found</Alert>;
  }

  return (
    <div className="item-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Item Details</h2>
        <div>
          <Button
            as={Link}
            to={`/inventories/${inventoryId}/items/${itemId}/edit`}
            variant="outline-primary"
            className="me-2"
          >
            Edit Item
          </Button>
          <Button
            variant="outline-danger"
            onClick={handleDelete}
            className="me-2"
          >
            Delete Item
          </Button>
          <Button
            as={Link}
            to={`/inventories/${inventoryId}`}
            variant="outline-secondary"
          >
            Back to Inventory
          </Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>{item.customId}</h4>
              <p className="text-muted mb-0">
                Created by: {item.createdBy?.username || 'Unknown'} •{' '}
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </Card.Header>
            <Card.Body>
              {inventory?.fields?.length > 0 ? (
                inventory.fields
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(field => {
                    const value = getFieldValue(field.type, field._id);

                    return (
                      <div key={field._id} className="mb-3">
                        <h6>{field.title}</h6>
                        {field.description && (
                          <p className="text-muted small">{field.description}</p>
                        )}

                        {field.type === 'boolean' ? (
                          <Badge bg={value ? 'success' : 'secondary'}>
                            {value ? 'Yes' : 'No'}
                          </Badge>
                        ) : field.type === 'document' && value ? (
                          <a href={value} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        ) : (
                          <p>{value ?? <span className="text-muted">Not set</span>}</p>
                        )}
                      </div>
                    );
                  })
              ) : (
                <p className="text-muted">No fields defined</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Item Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Custom ID:</strong>
                <p>{item.customId}</p>
              </div>

              <div className="mb-3">
                <strong>Created:</strong>
                <p>{new Date(item.createdAt).toLocaleString()}</p>
              </div>

              <div className="mb-3">
                <strong>Last Updated:</strong>
                <p>{new Date(item.updatedAt).toLocaleString()}</p>
              </div>

              <div className="mb-3">
                <strong>Created By:</strong>
                <p>{item.createdBy?.username || 'Unknown'}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Optional ErrorBoundary wrapper
export class ItemDetailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ItemDetailErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger">
          Something went wrong: {this.state.error?.message || 'Unknown error'}
        </Alert>
      );
    }
    return this.props.children;
  }
}

export default ItemDetail;
