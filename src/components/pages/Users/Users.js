import { Container, Table, Row, Form, Col, Button } from 'react-bootstrap';
import { NavLink, Navigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import { toast } from 'react-toastify';
import { PiMagnifyingGlassPlus } from "react-icons/pi";
import { MdOutlineDelete } from "react-icons/md";
import { PiUsersThree, PiUserPlus } from "react-icons/pi";
import Modal from 'react-bootstrap/Modal';

function Users() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState([]);
  const usernameForm = useRef(null)
  const passwordForm = useRef(null)
  const isadminForm = useRef(null)
  const isprivateForm = useRef(null)
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth() || { username: null, admin: null };
  const [displayData, setDisplayData] = useState([]);
  const authFilter = useRef(null)
  const [show, setShow] = useState(false);

  const handleFilterChange = () => {
    var newData = [];
    var privacyFilterValue = authFilter.current.value;
    if (privacyFilterValue === "All") {
      newData = [...data];
      setDisplayData(newData);
    } else {
      newData = data.filter(element => element.privacy === privacyFilterValue)
      setDisplayData(newData);
    }
  }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCreate = () => {
    onSubmitHandler();
    handleClose();
  }

  const handleDeleteClick = (username) => {
    if (window.confirm("Delete " + username + "?")) {
      fetch(url + "/users/" + username, {
        method: 'DELETE',
        headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth })
      }).then(() => fetchUsers()
      ).catch(err => {
        console.log(err.toString());
        toast.error("Error deleting user");
      });
    }
  }

  const fetchUsers = () => {
    return fetch(url + "/users", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setDisplayData(d)
      }).catch(err => {
        console.log(err.toString());
        toast.error("Error fetching users");
      });
  }

  const onSubmitHandler = (event) => {
    if (event)
      event.preventDefault();

    fetch(url + "/users", {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
      body: JSON.stringify({
        "username": usernameForm.current.value,
        "password": passwordForm.current.value,
        "is_admin": isadminForm.current.checked,
        "is_private": isprivateForm.current.checked,
      }),
    })
      .then(response => response.json())
      .then(() => {
        fetchUsers()
      }).catch(err => {
        toast.error(err.toString());
      });

  }

  useEffect(() => {
    document.title = 'Users';
    fetchUsers();
  }, []);

  return user.admin ? (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Row>
          <h1><PiUsersThree size="1.3em" /> Users</h1>
          <Row style={{ marginBottom: "10px" }}>
            <Col sm={3}>
              <Form.Group as={Col} controlId="formGridLLM">
                <Form.Label>Auth</Form.Label>
                <Form.Select ref={authFilter} onChange={handleFilterChange} defaultValue="All">
                  <option>All</option>
                  {
                    ["Local", "SSO"].map((type, index) => {
                      return (
                        <option key={index}>{type}</option>
                      )
                    })
                  }
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={9} style={{ paddingTop: "32px", textAlign: "right" }}>
              <Button variant="primary" onClick={handleShow}>
                New User
              </Button>
            </Col>
          </Row>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Username</th>
                <th>Auth</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                displayData.map((user, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <NavLink
                          to={"/users/" + user.username}
                        >
                          {user.username}
                        </NavLink>
                      </td>
                      <td>
                        {user.sso ? "SSO" : "Local"}
                      </td>
                      <td>
                        {user.is_admin ? "Admin" : "User"}
                      </td>
                      <td>
                        <NavLink
                          to={"/users/" + user.username}
                        >
                          <Button variant="dark"><PiMagnifyingGlassPlus size="1.2em" /> Details</Button>{' '}
                        </NavLink>
                        <Button onClick={() => handleDeleteClick(user.username)} variant="danger"><MdOutlineDelete size="1.3em" /> Delete</Button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </Row>
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title><PiUserPlus size="1.3em" /> New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={onSubmitHandler}>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridUserName">
                <Form.Label>Username</Form.Label>
                <Form.Control ref={usernameForm} />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridUserName">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" ref={passwordForm} />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridAdmin">
                <Form.Check ref={isadminForm} type="checkbox" label="Admin" />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridPrivate">
                <Form.Check ref={isprivateForm} type="checkbox" label="Private models only" />
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  ) : (
    <Navigate to="/" />
  );
}

export default Users;