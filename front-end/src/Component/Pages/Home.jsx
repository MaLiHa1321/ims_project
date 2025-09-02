import React from 'react';
import { Card, Row, Col, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section py-5 bg-light">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold mb-4">
                Manage Your Inventory with Ease
              </h1>
              <p className="lead mb-4">
                Track, organize, and manage all your items across multiple inventories. 
                Perfect for office equipment, library books, documents, and more.
              </p>
              <Button as={Link} to="/register" variant="primary" size="lg">
                Get Started
              </Button>
            </Col>
            <Col md={6}>
              <div className="text-center">
                <img 
                  src="https://via.placeholder.com/500x300?text=Inventory+Management" 
                  alt="Inventory Management" 
                  className="img-fluid rounded shadow"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <h2 className="text-center mb-5">Powerful Features</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">📋</div>
                  <Card.Title>Custom Inventories</Card.Title>
                  <Card.Text>
                    Create custom inventories with fields tailored to your specific needs.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">🔍</div>
                  <Card.Title>Advanced Search</Card.Title>
                  <Card.Text>
                    Find exactly what you need with our powerful full-text search.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">👥</div>
                  <Card.Title>Collaboration</Card.Title>
                  <Card.Text>
                    Share inventories with team members and control access levels.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;