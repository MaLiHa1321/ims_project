import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Offcanvas, Badge, Button, Form, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const token = localStorage.getItem('token');

  const staticSearchData = [
    { title: 'Manage Your Inventory with Ease', type: 'static', url: '/' },
    { title: 'Track, organize, and manage all your items', type: 'static', url: '/' },
    { title: 'Create custom inventories with fields tailored to your needs', type: 'static', url: '/' },
    { title: 'Find exactly what you need with our powerful full-text search', type: 'static', url: '/' },
    { title: 'Share inventories with team members and control access levels', type: 'static', url: '/' }
 
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, [token]);

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {

        let dynamicResults = [];
        if (token) {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const res = await axios.get(
            `https://ims-project-server.onrender.com/api/search?q=${encodeURIComponent(searchQuery)}`,
            config
          );
          dynamicResults = res.data || [];
        }

   
        const staticResults = staticSearchData.filter(entry =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults([...dynamicResults, ...staticResults]);
      } catch (err) {
        console.error('Search error:', err);
      }
    };

    const debounce = setTimeout(fetchResults, 300); 
    return () => clearTimeout(debounce);
  }, [searchQuery, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <>
      <Navbar
        bg={theme === 'dark' ? 'dark' : 'light'}
        variant={theme === 'dark' ? 'dark' : 'light'}
        expand="lg"
        className="mb-4"
      >
        <Container fluid>
          <Navbar.Brand as={Link} to="/">📦 Inventory Manager</Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">Inventory Manager</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">

                <Nav.Link as={Link} to="/">Home</Nav.Link>

                {token ? (
                  <>
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                    {user && user.isAdmin && (
                      <Nav.Link as={Link} to="/admin">
                        Admin <Badge bg="danger">Admin</Badge>
                      </Nav.Link>
                    )}
                    <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                  </>
                )}

           
                <Button
                  variant={theme === 'dark' ? 'secondary' : 'outline-secondary'}
                  size="sm"
                  className="ms-2"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </Button>

              
                <div className="ms-3 position-relative">
                  <Form.Control
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                  {searchResults.length > 0 && (
                    <ListGroup
                      className="position-absolute w-100 zindex-tooltip"
                      style={{ top: '38px', maxHeight: '300px', overflowY: 'auto' }}
                    >
                      {searchResults.map(result => (
                        <ListGroup.Item
                          key={result._id || result.title} 
                          action
                          onClick={() => {
                            navigate(result.url);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                        >
                          {result.title} {result.type === 'static' && <em className="text-muted">(info)</em>}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>

              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      <Container fluid="md" className="main-content">{children}</Container>

      <footer className={`text-center py-3 mt-5 bg-${theme}`}>
        <Container>
          <p className={`mb-0 text-${theme === 'dark' ? 'light' : 'dark'}`}>
            Inventory Management System &copy; 2025
          </p>
        </Container>
      </footer>
    </>
  );
};

export default Layout;
