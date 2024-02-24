import React, { useContext } from 'react';
import { Container, Navbar, Button, Nav } from 'react-bootstrap';
import { NavLink } from "react-router-dom";
import { AuthContext } from './AuthProvider.js';
import restaiLogo from '../../assets/img/restai-logo.png';
import { MdOutlinePerson, MdLogout } from "react-icons/md";
import { PiBrain, PiUsersThree, PiGraph } from "react-icons/pi";
import { HiOutlineServerStack } from "react-icons/hi2";



function Navigation() {
  const { logout, getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth() || { username: null, admin: null };

  const name = process.env.REACT_APP_RESTAI_NAME || "RestAI";

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/admin">
          <img
            alt=""
            src={restaiLogo}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          {name}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as="li">
              <NavLink
                to="/"
              >
                <PiGraph size="1.3em"/> Projects
              </NavLink>
            </Nav.Link>
            {user.admin && (
              <Nav.Link as="li">
                <NavLink
                  to="/users"
                >
                  <PiUsersThree size="1.3em"/> Users
                </NavLink>
              </Nav.Link>
            )}
            <Nav.Link as="li">
              <NavLink
                to="/llms"
              >
                <PiBrain size="1.3em"/> LLMs
              </NavLink>
            </Nav.Link>
            <Nav.Link as="li">|</Nav.Link>
            <Nav.Link as="li">
              <a href="/docs"><HiOutlineServerStack size="1.3em"/> API</a>
            </Nav.Link>
          </Nav>
          {user.username && (
            <Nav>
              <Navbar.Text>
                <b>Signed in as:</b>  {' '}
                <NavLink
                  to={"/users/" + user.username}
                >
                  <MdOutlinePerson size="1.5em"/>{user.username}{' | '}
                </NavLink>
                <Button style={{ textDecoration: "none", color: "black", padding: "0px", verticalAlign: "0px" }} variant="link" onClick={logout}>
                <MdLogout size="1.5em"/>Logout
                </Button>
              </Navbar.Text>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;