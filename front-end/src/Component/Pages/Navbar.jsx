// import React from 'react';
// import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
// import { LinkContainer } from 'react-router-bootstrap';

// const Navbar = () => {
//   const token = localStorage.getItem('token');

//   const logout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   };

//   // In your Layout.js or Navbar component
// {token && user.isAdmin && (
//   <Nav.Link as={Link} to="/admin">
//     Admin
//   </Nav.Link>
// )}

//   return (
//     <BootstrapNavbar bg="dark" variant="dark" expand="lg">
//       <Container>
//         <LinkContainer to="/">
//           <BootstrapNavbar.Brand>Inventory Manager</BootstrapNavbar.Brand>
//         </LinkContainer>
//         <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
//         <BootstrapNavbar.Collapse id="basic-navbar-nav">
//           <Nav className="ms-auto">
//             {token ? (
//               <>
//                 <LinkContainer to="/">
//                   <Nav.Link>Home</Nav.Link>
//                 </LinkContainer>
//                 <Nav.Link onClick={logout}>Logout</Nav.Link>
//               </>
//             ) : (
//               <>
//                 <LinkContainer to="/login">
//                   <Nav.Link>Login</Nav.Link>
//                 </LinkContainer>
//                 <LinkContainer to="/register">
//                   <Nav.Link>Register</Nav.Link>
//                 </LinkContainer>
//               </>
//             )}
//           </Nav>
//         </BootstrapNavbar.Collapse>
//       </Container>
//     </BootstrapNavbar>
//   );
// };

// export default Navbar;

import React, { useEffect, useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import jwt_decode from 'jwt-decode'; // optional, if token contains user info

const Navbar = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt_decode(token); // assuming token has user info
        setUser(decoded);
      } catch (err) {
        console.error('Invalid token');
        setUser(null);
      }
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand>Inventory Manager</BootstrapNavbar.Brand>
        </LinkContainer>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {token && user ? (
              <>
                <LinkContainer to="/">
                  <Nav.Link>Home</Nav.Link>
                </LinkContainer>
                {user.isAdmin && (
                  <LinkContainer to="/admin">
                    <Nav.Link>Admin</Nav.Link>
                  </LinkContainer>
                )}
                <Nav.Link onClick={logout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
