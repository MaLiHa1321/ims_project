
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Pagination } from 'react-bootstrap';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.get(
        `https://ims-project-server.onrender.com/api/admin/users?page=${currentPage}&limit=10`,
        config
      );
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setSelectedUsers([]);
    } catch (error) {
      console.log(error)
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) setSelectedUsers([]);
    else setSelectedUsers(users.map((u) => u._id));
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return alert('No users selected');
    if (!window.confirm(`Delete ${selectedUsers.length} users?`)) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await Promise.all(
        selectedUsers
          .filter(id => id !== currentUserId) 
          .map((id) =>
            axios.delete(`https://ims-project-server.onrender.com/api/admin/users/${id}`, config)
          )
      );

      setSuccess('Selected users deleted successfully (excluding yourself)');
      fetchUsers();
    } catch (error) {
      console.log(error);
      setError('Failed to delete users');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkBlock = async (block = true) => {
    if (selectedUsers.length === 0) return alert('No users selected');

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

      await Promise.all(
        selectedUsers
          .filter(id => id !== currentUserId) 
          .map((id) =>
            axios.put(`https://ims-project-server.onrender.com/api/admin/users/${id}`, { isBlocked: block }, config)
          )
      );

      setSuccess(`Selected users ${block ? 'blocked' : 'unblocked'} successfully (excluding yourself)`);
      fetchUsers();
    } catch (error) {
      console.log(error)
      setError('Failed to update users');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">Admin Dashboard</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="mb-3 d-flex gap-2">
        <Button variant="danger" disabled={actionLoading} onClick={handleBulkDelete}>
          Delete Selected
        </Button>
        <Button variant="warning" disabled={actionLoading} onClick={() => handleBulkBlock(true)}>
          Block Selected
        </Button>
        <Button variant="success" disabled={actionLoading} onClick={() => handleBulkBlock(false)}>
          Unblock Selected
        </Button>
      </div>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3>User Management</h3>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Admin</th>
                      <th>Status</th>
                      <th>Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                          />
                        </td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                        <td>
                          {user.isBlocked ? (
                            <span className="badge bg-danger">Blocked</span>
                          ) : user.isLocked ? (
                            <span className="badge bg-warning">Locked</span>
                          ) : (
                            <span className="badge bg-success">Active</span>
                          )}
                        </td>
                        <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
