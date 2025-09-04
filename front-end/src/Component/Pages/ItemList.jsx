import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Pagination, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ItemList = ({ inventoryId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inventory, setInventory] = useState({ fields: [] });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchItems();
   
  }, [inventoryId, currentPage]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `https://ims-project-server.onrender.com/api/inventories/${inventoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInventory(res.data || { fields: [] });
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setInventory({ fields: [] });
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `https://ims-project-server.onrender.com/api/items/inventory/${inventoryId}?page=${currentPage}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(Array.isArray(res.data.items) ? res.data.items : []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://ims-project-server.onrender.com/api/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchItems();
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        Array.from(selectedItems).map((itemId) =>
          axios.delete(`https://ims-project-server.onrender.com/api/items/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      fetchItems();
      setSelectedItems(new Set());
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting items:', err);
      setError('Failed to delete items');
    }
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(items.map((item) => item._id)));
  };

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const tableFields = (inventory.fields || []).filter(f => f.showInTableView);
  const colSpan = 3 + tableFields.length; 

  return (
    <div className="item-list">
      {selectedItems.size > 0 && (
        <Row className="mb-3">
          <Col>
            <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
              <span>{selectedItems.size} item(s) selected</span>

              
              {selectedItems.size === 1 && (
                <Button
                  as={Link}
                  to={`/inventories/${inventoryId}/items/${Array.from(selectedItems)[0]}`}
                  variant="outline-primary"
                  size="sm"
                >
                  View
                </Button>
              )}

              {/* Delete Selected */}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Selected
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {showDeleteConfirm && (
        <Alert variant="warning" className="mb-3">
          <h5>Confirm Deletion</h5>
          <p>Are you sure you want to delete {selectedItems.size} item(s)? This action cannot be undone.</p>
          <div className="d-flex gap-2">
            <Button variant="danger" onClick={handleBulkDelete}>Yes, Delete</Button>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  checked={selectedItems.size === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Custom ID</th>
              {tableFields.map(field => <th key={field._id}>{field.title}</th>)}
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-4">
                  <p>No items found in this inventory</p>
                  <Button as={Link} to={`/inventories/${inventoryId}/items/new`} variant="primary">
                    Add First Item
                  </Button>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item._id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedItems.has(item._id)}
                      onChange={() => toggleSelectItem(item._id)}
                    />
                  </td>
                  <td><strong>{item.customId}</strong></td>
                  {tableFields.map(field => {
                    const fieldArray = item[`${field.type}Fields`] || [];
                    const fieldValue = fieldArray.find(f => f.fieldId?.toString() === field._id.toString())?.value;
                    return (
                      <td key={field._id}>
                        {field.type === 'boolean' ? (fieldValue ? 'Yes' : 'No') : fieldValue || '-'}
                      </td>
                    );
                  })}
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={currentPage === idx + 1}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ItemList;
