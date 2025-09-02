import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spinner, Pagination, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InventoryList = ({ type = 'all', title }) => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventories();
  }, [type, currentPage]);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      let url = '';
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (type === 'my') {
        url = `https://ims-project-server.onrender.com/api/inventories/my?page=${currentPage}&limit=6`;
      } else if (type === 'shared') {
        url = `https://ims-project-server.onrender.com/api/inventories/shared?page=${currentPage}&limit=6`;
      } else {
        url = `https://ims-project-server.onrender.com/api/inventories?page=${currentPage}&limit=6`;
      }

      const res = await axios.get(url, config);
      setInventories(res.data.inventories);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to load inventories');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  return (
    <div className="inventory-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>{title}</h3>
        {type === 'my' && (
          <Button as={Link} to="/inventories/new" variant="primary">
            Create New Inventory
          </Button>
        )}
      </div>

      {inventories.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No inventories found</h4>
            <p className="text-muted">
              {type === 'my'
                ? "You haven't created any inventories yet."
                : type === 'shared'
                ? "You don't have access to any shared inventories."
                : 'No inventories available.'}
            </p>
            {type === 'my' && (
              <Button as={Link} to="/inventories/new" variant="primary">
                Create Your First Inventory
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            {inventories.map((inventory) => (
              <Col key={inventory._id} md={6} lg={4} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>{inventory.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {inventory.description && inventory.description.length > 100
                        ? `${inventory.description.substring(0, 100)}...`
                        : inventory.description || 'No description'}
                    </Card.Text>
                    <div className="mb-2">
                      <span className="badge bg-secondary">{inventory.category}</span>
                      {inventory.isPublic && (
                        <span className="badge bg-info ms-1">Public</span>
                      )}
                    </div>
                    <Card.Text>
                      <small className="text-muted">
                        Created by: {inventory.createdBy?.username || 'Unknown'}
                      </small>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button
                        as={Link}
                        to={`/inventories/${inventory._id}`}
                        variant="outline-primary"
                      >
                        View Inventory
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryList;