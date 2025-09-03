import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Pagination, Alert } from 'react-bootstrap';
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
        headers: { Authorization: `Bearer ${token}` },
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
        <Alert variant="info" className="text-center">
          {type === 'my'
            ? "You haven't created any inventories yet."
            : type === 'shared'
            ? "You don't have access to any shared inventories."
            : 'No inventories available.'}
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Category</th>
                <th>Visibility</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {inventories.map((inventory) => (
                <tr
                  key={inventory._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/inventories/${inventory._id}`)}
                >
                  <td>{inventory.title}</td>
                  <td>
                    {inventory.description && inventory.description.length > 50
                      ? `${inventory.description.substring(0, 50)}...`
                      : inventory.description || 'No description'}
                  </td>
                  <td>{inventory.category}</td>
                  <td>{inventory.isPublic ? 'Public' : 'Private'}</td>
                  <td>{inventory.createdBy?.username || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </Table>

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
