
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomIdBuilder from './CustomIdBuilder';

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inventory, setInventory] = useState({
    title: '',
    description: '',
    category: 'Other',
    tags: [],
    isPublic: false,
    customIdFormat: [],
    fields: []
  });
  const [newField, setNewField] = useState({
    title: '',
    type: 'text',
    description: '',
    showInTableView: true,
    order: 0
  });

  useEffect(() => {
    if (id) fetchInventory();
  }, [id]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://ims-project-server.onrender.com/api/inventories/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      setInventory(res.data);
    } catch (err) {
      setError('Failed to load inventory');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInventory(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNewFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewField(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setInventory(prev => ({ ...prev, tags }));
  };

  const handleCustomIdFormatChange = (newFormat) => {
    setInventory(prev => ({ ...prev, customIdFormat: newFormat }));
  };

  const addField = () => {
    if (!newField.title) {
      setError('Field title is required');
      return;
    }
    
    const field = {
      ...newField,
      order: inventory.fields.length
    };
    
    setInventory(prev => ({
      ...prev,
      fields: [...prev.fields, field]
    }));
    
    // Reset new field form
    setNewField({
      title: '',
      type: 'text',
      description: '',
      showInTableView: true,
      order: 0
    });
  };

  const removeField = (index) => {
    const newFields = [...inventory.fields];
    newFields.splice(index, 1);
    setInventory(prev => ({ ...prev, fields: newFields }));
  };

  const moveField = (index, direction) => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === inventory.fields.length - 1)) {
      return;
    }
    
    const newFields = [...inventory.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap positions
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update order values
    newFields.forEach((field, i) => {
      field.order = i;
    });
    
    setInventory(prev => ({ ...prev, fields: newFields }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      };

      if (id) {
        await axios.put(`https://ims-project-server.onrender.com/api/inventories/${id}`, { ...inventory, version: inventory.version }, config);
        setSuccess('Inventory updated successfully');
      } else {
        const res = await axios.post('https://ims-project-server.onrender.com/api/inventories', inventory, config);
        setSuccess('Inventory created successfully');
        navigate(`/inventories/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save fields manually
  const saveFields = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      };

      await axios.put(`https://ims-project-server.onrender.com/api/inventories/${id}`, inventory, config);
      setSuccess('Fields saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save fields');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Card className="mt-4">
            <Card.Header>
              <h2>{id ? 'Edit Inventory' : 'Create New Inventory'}</h2>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Tabs defaultActiveKey="basic" className="mb-3">
               
                <Tab eventKey="basic" title="Basic Info">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={inventory.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter inventory title"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={inventory.description}
                        onChange={handleChange}
                        placeholder="Describe this inventory"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select name="category" value={inventory.category} onChange={handleChange}>
                        <option value="Equipment">Equipment</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Book">Book</option>
                        <option value="Document">Document</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Tags</Form.Label>
                      <Form.Control
                        type="text"
                        value={inventory.tags.join(', ')}
                        onChange={handleTagsChange}
                        placeholder="Enter tags separated by commas"
                      />
                      <Form.Text className="text-muted">Separate tags with commas</Form.Text>
                    </Form.Group>

                    <Form.Check
                      type="checkbox"
                      name="isPublic"
                      label="Make this inventory public"
                      checked={inventory.isPublic}
                      onChange={handleChange}
                      className="mb-3"
                    />

                    <div className="d-flex gap-2">
                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (id ? 'Update Inventory' : 'Create Inventory')}
                      </Button>
                      <Button variant="secondary" onClick={() => navigate(id ? `/inventories/${id}` : '/inventories')}>
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </Tab>

            
                <Tab eventKey="idFormat" title="Custom ID Format">
                  {id ? (
                    <CustomIdBuilder
                      inventoryId={id}
                      customIdFormat={inventory.customIdFormat || []}
                      onChange={handleCustomIdFormatChange}
                    />
                  ) : (
                    <div className="text-center py-4">
                      <p>Custom ID format can be configured after creating the inventory.</p>
                      <Button variant="primary" onClick={() => document.querySelector('[type="submit"]').click()}>
                        Create Inventory First
                      </Button>
                    </div>
                  )}
                </Tab>

                <Tab eventKey="fields" title="Custom Fields">
                  {id ? (
                    <div>
                      <h4>Add New Field</h4>
                      <Row className="mb-4">
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Field Title *</Form.Label>
                            <Form.Control
                              type="text"
                              name="title"
                              value={newField.title}
                              onChange={handleNewFieldChange}
                              placeholder="Enter field title"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Field Type</Form.Label>
                            <Form.Select name="type" value={newField.type} onChange={handleNewFieldChange}>
                              <option value="text">Text</option>
                              <option value="textarea">Text Area</option>
                              <option value="number">Number</option>
                              <option value="boolean">Yes/No</option>
                              <option value="document">Document URL</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              type="text"
                              name="description"
                              value={newField.description}
                              onChange={handleNewFieldChange}
                              placeholder="Field description (optional)"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex align-items-end">
                          <Form.Check
                            type="checkbox"
                            name="showInTableView"
                            label="Show in Table"
                            checked={newField.showInTableView}
                            onChange={handleNewFieldChange}
                            className="mb-3"
                          />
                        </Col>
                      </Row>
                      <Button onClick={addField} variant="success" className="mb-4">
                        Add Field
                      </Button>

                      <h4>Current Fields</h4>
                      {inventory.fields.length === 0 ? (
                        <p className="text-muted">No fields added yet.</p>
                      ) : (
                        <div className="fields-list">
                          {inventory.fields.map((field, index) => (
                            <Card key={index} className="mb-2">
                              <Card.Body className="py-2">
                                <Row className="align-items-center">
                                  <Col md={4}>
                                    <strong>{field.title}</strong>
                                    <div className="text-muted small">{field.type}</div>
                                  </Col>
                                  <Col md={4}>
                                    {field.description && (
                                      <div className="text-muted">{field.description}</div>
                                    )}
                                  </Col>
                                  <Col md={2}>
                                    <Form.Check
                                      type="checkbox"
                                      label="Show in Table"
                                      checked={field.showInTableView}
                                      disabled
                                    />
                                  </Col>
                                  <Col md={2} className="text-end">
                                    <div className="btn-group">
                                      <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => moveField(index, 'up')}
                                        disabled={index === 0}
                                      >
                                        ↑
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => moveField(index, 'down')}
                                        disabled={index === inventory.fields.length - 1}
                                      >
                                        ↓
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => removeField(index)}
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}

               
                      <div className="mt-3">
                        <Button onClick={saveFields} variant="primary" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Fields'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p>Custom fields can be added after creating the inventory.</p>
                      <Button variant="primary" onClick={() => document.querySelector('[type="submit"]').click()}>
                        Create Inventory First
                      </Button>
                    </div>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InventoryForm;
