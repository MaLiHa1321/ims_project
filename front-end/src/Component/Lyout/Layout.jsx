import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Offcanvas, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Get user data from localStorage if available
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            📦 Inventory Manager
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                Inventory Manager
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                
                {token ? (
                  <>
                    <Nav.Link as={Link} to="/dashboard">
                      Dashboard
                    </Nav.Link>
                    <Nav.Link as={Link} to="/inventories">
                      My Inventories
                    </Nav.Link>
                    <Nav.Link as={Link} to="/inventories/new">
                      Create Inventory
                    </Nav.Link>
                    
                    {user && user.isAdmin && (
                      <Nav.Link as={Link} to="/admin">
                        Admin <Badge bg="danger">Admin</Badge>
                      </Nav.Link>
                    )}
                    
                    <Nav.Link onClick={handleLogout}>
                      Logout
                    </Nav.Link>
                    
                    <Nav.Link className="text-muted">
                      Signed in as: {user?.username}
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login">
                      Login
                    </Nav.Link>
                    <Nav.Link as={Link} to="/register">
                      Register
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      <Container fluid="md" className="main-content">
        {children}
      </Container>

      <footer className="bg-dark text-light text-center py-3 mt-5">
        <Container>
          <p className="mb-0">Inventory Management System &copy; 2023</p>
        </Container>
      </footer>
    </>
  );
};

export default Layout;