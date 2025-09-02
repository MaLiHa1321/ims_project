// frontend/src/components/InventoryStats.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, ProgressBar, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const InventoryStats = ({ inventoryId: propInventoryId }) => {
     const { inventoryId: paramInventoryId } = useParams();
  const inventoryId = propInventoryId || paramInventoryId;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // In frontend/src/components/InventoryStats.js - Add this to the component
const [lastUpdated, setLastUpdated] = useState(new Date());

// Add a refresh function
const refreshStats = () => {
  setLastUpdated(new Date());
  fetchStats();
};


  useEffect(() => {
    fetchStats();
  }, [inventoryId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(`https://ims-project-server.onrender.com/api/stats/inventory/${inventoryId}`, config);
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
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

  if (!stats) {
    return <Alert variant="warning">No statistics available</Alert>;
  }

  return (
    <div className="inventory-stats">
      {/* Overview Cards */}

      <small className="text-muted">
  Last refreshed: {lastUpdated.toLocaleTimeString()}
</small>


     <Row className="mb-4">
  <Col>
    <div className="d-flex justify-content-between align-items-center">
      <h4>Inventory Statistics</h4>
      <Button variant="outline-primary" onClick={refreshStats} size="sm">
        Refresh
      </Button>
    </div>
  </Col>
</Row>

      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Card.Title as="h2">{stats.totalItems}</Card.Title>
              <Card.Text>Total Items</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Card.Title as="h5">
                {stats.createdDates.oldest ? new Date(stats.createdDates.oldest).toLocaleDateString() : 'N/A'}
              </Card.Title>
              <Card.Text>Oldest Item</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Card.Title as="h5">
                {stats.createdDates.newest ? new Date(stats.createdDates.newest).toLocaleDateString() : 'N/A'}
              </Card.Title>
              <Card.Text>Newest Item</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Card.Title as="h5">
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'N/A'}
              </Card.Title>
              <Card.Text>Last Updated</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Numeric Fields */}
      {Object.keys(stats.fieldStats.number).length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Numeric Fields</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(stats.fieldStats.number).map(([fieldId, fieldData]) => (
                <Col md={6} key={fieldId} className="mb-3">
                  <Card>
                    <Card.Header>
                      <h6>{fieldData.field}</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Count:</span>
                        <span>{fieldData.count}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Average:</span>
                        <span>{fieldData.average}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Min:</span>
                        <span>{fieldData.min}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Max:</span>
                        <span>{fieldData.max}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Sum:</span>
                        <span>{fieldData.sum}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Text Fields */}
      {Object.keys(stats.fieldStats.text).length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Text Fields</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(stats.fieldStats.text).map(([fieldId, fieldData]) => (
                <Col md={6} key={fieldId} className="mb-3">
                  <Card>
                    <Card.Header>
                      <h6>{fieldData.field}</h6>
                      <small className="text-muted">
                        {fieldData.uniqueCount} unique values out of {fieldData.count} total
                      </small>
                    </Card.Header>
                    <Card.Body>
                      <h6>Top Values:</h6>
                      {fieldData.topValues.length > 0 ? (
                        fieldData.topValues.map((value, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-truncate" style={{ maxWidth: '70%' }}>
                              {value.value}
                            </span>
                            <Badge bg="secondary">{value.count}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">No data available</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Textarea Fields */}
      {Object.keys(stats.fieldStats.textarea).length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Text Area Fields</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(stats.fieldStats.textarea).map(([fieldId, fieldData]) => (
                <Col md={6} key={fieldId} className="mb-3">
                  <Card>
                    <Card.Header>
                      <h6>{fieldData.field}</h6>
                      <small className="text-muted">
                        {fieldData.uniqueCount} unique values out of {fieldData.count} total
                      </small>
                    </Card.Header>
                    <Card.Body>
                      <h6>Top Values:</h6>
                      {fieldData.topValues.length > 0 ? (
                        fieldData.topValues.map((value, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-truncate" style={{ maxWidth: '70%' }}>
                              {value.value}
                            </span>
                            <Badge bg="secondary">{value.count}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">No data available</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Boolean Fields */}
      {Object.keys(stats.fieldStats.boolean).length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Boolean Fields</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(stats.fieldStats.boolean).map(([fieldId, fieldData]) => (
                <Col md={6} key={fieldId} className="mb-3">
                  <Card>
                    <Card.Header>
                      <h6>{fieldData.field}</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>True: {fieldData.trueCount} ({fieldData.truePercentage}%)</span>
                          <span>False: {fieldData.falseCount} ({fieldData.falsePercentage}%)</span>
                        </div>
                        <ProgressBar>
                          <ProgressBar 
                            variant="success" 
                            now={fieldData.truePercentage} 
                            key={1} 
                            label={`${fieldData.truePercentage}%`}
                          />
                          <ProgressBar 
                            variant="danger" 
                            now={fieldData.falsePercentage} 
                            key={2} 
                            label={`${fieldData.falsePercentage}%`}
                          />
                        </ProgressBar>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Total:</span>
                        <span>{fieldData.count}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {Object.keys(stats.fieldStats.number).length === 0 && 
       Object.keys(stats.fieldStats.text).length === 0 && 
       Object.keys(stats.fieldStats.textarea).length === 0 && 
       Object.keys(stats.fieldStats.boolean).length === 0 && (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No Field Statistics Available</h5>
            <p className="text-muted">
              This inventory doesn't have any custom fields with data yet.
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default InventoryStats;