import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Spinner, Alert, Tabs, Tab, Button, Container, Badge } from 'react-bootstrap';
import axios from 'axios';
import ItemList from './ItemList';
import ItemForm from './ItemForm';
import InventoryStats from './InventoryStats';
import InventoryStatsChart from './InventoryStatsChart';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
const [statsLoading, setStatsLoading] = useState(true);
const [statsError, setStatsError] = useState('');
// Add state for modal
const [showItemModal, setShowItemModal] = useState(false);
const [editingItem, setEditingItem] = useState(null);



useEffect(() => {
  if (!inventory) return;

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`https://ims-project-server.onrender.com/api/stats/inventory/${id}`, config);
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  fetchStats();
}, [inventory, id]);


  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      // If no token, redirect to login
      navigate('/login');
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchInventory();
  }, [id, navigate]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Use relative URL to avoid CORS issues
      const res = await axios.get(`https://ims-project-server.onrender.com/api/inventories/${id}`, config);
      setInventory(res.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 404) {
        setError('Inventory not found');
      } else {
        setError('Failed to load inventory. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit this inventory
  // Handle both cases where createdBy might be an object or just an ID string
  const canEdit = inventory && user && (
    (typeof inventory.createdBy === 'object' 
      ? inventory.createdBy._id === user.id 
      : inventory.createdBy === user.id) || 
    user.isAdmin || 
    (inventory.allowedUsers && inventory.allowedUsers.some(u => 
      (typeof u === 'object' ? u._id === user.id : u === user.id)
    ))
  );

  if (loading) {
    return (
      <Container>
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="my-4">
          {error}
          {error.includes('session') && (
            <div className="mt-2">
              <Button as={Link} to="/login" variant="primary">
                Go to Login
              </Button>
            </div>
          )}
        </Alert>
      </Container>
    );
  }

  if (!inventory) {
    return (
      <Container>
        <Alert variant="warning" className="my-4">
          Inventory not found
          <div className="mt-2">
            <Button as={Link} to="/inventories" variant="primary">
              Back to Inventories
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="inventory-detail">
        {/* Header section with edit button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>{inventory.title}</h1>
          <div>
            {canEdit && (
              <Button 
                as={Link} 
                to={`/inventories/${inventory._id}/edit`} 
                variant="outline-primary"
                className="me-2"
              >
                Edit Inventory
              </Button>
            )}
            <Button as={Link} to="/inventories" variant="outline-secondary">
              Back to Inventories
            </Button>
          </div>
        </div>

        <Tabs defaultActiveKey="overview" className="mb-3">
          <Tab eventKey="overview" title="Overview">
            <Card>
              <Card.Body>
                <h4>Description</h4>
                <p>{inventory.description || 'No description provided'}</p>
                
                <div className="row mt-4">
                  <div className="col-md-6">
                    <h5>Details</h5>
                    <p>
                      <strong>Category:</strong> {inventory.category}
                    </p>
                    <p>
                      <strong>Visibility:</strong>{' '}
                      {inventory.isPublic ? 'Public' : 'Private'}
                    </p>
                    <p>
                      <strong>Created by:</strong> {typeof inventory.createdBy === 'object' ? inventory.createdBy.username : 'Unknown'}
                    </p>
                    <p>
                      <strong>Created at:</strong>{' '}
                      {new Date(inventory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="col-md-6">
                    <h5>Tags</h5>
                    <div>
                      {inventory.tags && inventory.tags.length > 0 ? (
                        inventory.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1 mb-1">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p className="text-muted">No tags</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Tab>
       
<Tab eventKey="items" title="Items">
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h4>Items</h4>
    <Button onClick={() => setShowItemModal(true)}>
      Add New Item
    </Button>
  </div>

  {/* Only render ItemList if inventory is loaded */}
  {inventory?._id ? (
    <ItemList inventoryId={inventory._id} />
  ) : (
    <p>Loading items...</p>
  )}

  {/* Item Modal */}
  {showItemModal && (
    <div className="modal-backdrop show">
      <div className="modal d-block">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editingItem ? 'Edit Item' : 'Add New Item'}</h5>
              <Button
                type="button"
                variant="close"
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                }}
              >
                &times;
              </Button>
            </div>
            <div className="modal-body">
              <ItemForm
                inventoryId={inventory._id}
                itemId={editingItem}
                onSave={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                  // Refresh items by refetching
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</Tab>

          <Tab eventKey="idFormat" title="Custom ID Format">
            <Card>
              <Card.Body>
                <h4>Custom ID Format</h4>
                {inventory.customIdFormat && inventory.customIdFormat.length > 0 ? (
                  <div>
                    <p>Current ID format:</p>
                    <div className="border p-3 rounded">
                      {inventory.customIdFormat.sort((a, b) => a.order - b.order).map((element, index) => (
                        <Badge key={index} bg="secondary" className="me-1">
                          {element.type}: {element.value || element.format || 'N/A'}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3">
                      <small className="text-muted">
                        This format will be used to generate unique IDs for new items in this inventory.
                      </small>
                    </p>
                  </div>
                ) : (
                  <p className="text-muted">No custom ID format defined</p>
                )}
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="fields" title="Fields">
            <Card>
              <Card.Body>
                <h4>Custom Fields</h4>
                {inventory.fields && inventory.fields.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Show in Table</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.fields.map((field, index) => (
                          <tr key={index}>
                            <td>{field.title}</td>
                            <td>
                              <span className="badge bg-info">
                                {field.type}
                              </span>
                            </td>
                            <td>
                              {field.showInTableView ? 'Yes' : 'No'}
                            </td>
                            <td>{field.description || 'No description'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No custom fields defined</p>
                )}
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="access" title="Access Settings">
            <Card>
              <Card.Body>
                <h4>Access Control</h4>
                <p>
                  <strong>Visibility:</strong>{' '}
                  {inventory.isPublic ? 'Public' : 'Private'}
                </p>
                
                {!inventory.isPublic && (
                  <>
                    <h5 className="mt-4">Allowed Users</h5>
                    {inventory.allowedUsers && inventory.allowedUsers.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Username</th>
                              <th>Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventory.allowedUsers.map((user) => (
                              <tr key={typeof user === 'object' ? user._id : user}>
                                <td>{typeof user === 'object' ? user.username : 'Unknown'}</td>
                                <td>{typeof user === 'object' ? user.email : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted">No users have access to this inventory</p>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Tab>
     <Tab eventKey="stats" title="Statistics">
  {statsLoading ? (
    <Spinner animation="border" />
  ) : statsError ? (
    <Alert variant="danger">{statsError}</Alert>
  ) : stats ? (
    <div>
      {/* Text-based stats */}
      <InventoryStats stats={stats} />

      {/* Chart-based stats */}
      <InventoryStatsChart stats={stats} />
    </div>
  ) : (
    <p>No stats available</p>
  )}
</Tab>


        </Tabs>
      </div>
    </Container>
  );
};

export default InventoryDetail;