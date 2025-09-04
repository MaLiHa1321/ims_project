
import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import axios from 'axios';

const AdminSetup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const body = JSON.stringify({ username, email, password, isAdmin: true });
      const res = await axios.post('https://ims-project-server.onrender.com/api/admin/setup', body, config);

      setSuccess(res.data.message || 'Admin account created successfully');
      setError('');
      setLoading(false);

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="mt-5 shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Create Administrator Account</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    name="username"
                    value={username}
                    onChange={onChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="aa12@gmail.com"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="aa12@#.."
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? 'Creating admin...' : 'Create Admin'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminSetup;
