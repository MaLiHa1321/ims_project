import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InventoryList from '../Pages/InventoryList';
import InventoryStats from './InventoryStats';
import InventoryStatsChart from './InventoryStatsChart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    myInventories: 0,
    sharedInventories: 0,
    totalItems: 0,
    inventories: [] // 👈 will hold detailed inventory stats from /api/stats
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statsError, setStatsError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch inventory counts
      const [myRes, sharedRes] = await Promise.all([
        axios.get('http://localhost:5000/api/inventories/my?limit=1', config),
        axios.get('http://localhost:5000/api/inventories/shared?limit=1', config),
      ]);

      // Fetch detailed stats
      let statsRes = { data: [] };
      try {
        statsRes = await axios.get('http://localhost:5000/api/stats', config);
      } catch (itemsError) {
        console.warn('Could not fetch item stats:', itemsError);
        setStatsError('Item statistics temporarily unavailable');
      }

      const inventories = statsRes.data || [];
      const totalItems = inventories.reduce((sum, inv) => sum + (inv.totalItems || 0), 0);

      setStats({
        myInventories: myRes.data.totalInventories,
        sharedInventories: sharedRes.data.totalInventories,
        totalItems,
        inventories // 👈 keep full array for charts
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">Dashboard</h1>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {statsError && <Alert variant="warning" className="mb-4">{statsError}</Alert>}

      {/* Stats Cards */}
      <Row className="mb-5">
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title as="h2">{stats.myInventories}</Card.Title>
              <Card.Text>My Inventories</Card.Text>
            </Card.Body>
            <Card.Footer>
              <Button as={Link} to="/inventories" variant="outline-primary" size="sm">
                View All
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title as="h2">{stats.totalItems}</Card.Title>
              <Card.Text>Total Items</Card.Text>
              {statsError && <small className="text-muted d-block mt-1">Estimate only</small>}
            </Card.Body>
            <Card.Footer>
              <Button variant="outline-primary" size="sm" disabled>
                View Items
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title as="h2">{stats.sharedInventories}</Card.Title>
              <Card.Text>Shared Inventories</Card.Text>
            </Card.Body>
            <Card.Footer>
              <Button variant="outline-primary" size="sm" disabled>
                View Shared
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Inventory Stats + Chart */}
      <Row className="mb-5">
        <Col>
          <h3>Inventory Stats Overview</h3>
          {statsError ? (
            <Alert variant="danger">{statsError}</Alert>
          ) : (
            <>
              <InventoryStats stats={stats} />
              <InventoryStatsChart inventories={stats.inventories} /> 
              {/* 👆 pass inventories array instead of single stats */}
            </>
          )}
        </Col>
      </Row>

      {/* Inventory Lists */}
      <Row>
        <Col lg={6} className="mb-5">
          <InventoryList type="my" title="My Inventories" />
        </Col>
        <Col lg={6} className="mb-5">
          <InventoryList type="shared" title="Shared Inventories" />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
