import { Container, Table, Row, Form, Col, Button, Alert } from 'react-bootstrap';
import { NavLink, Navigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function LLMs() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState([]);
  const [error, setError] = useState([]);
  const nameForm = useRef(null)
  const classnameForm = useRef(null)
  const optionsForm = useRef(null)
  const privacyForm = useRef(null)
  const typeForm = useRef(null)
  const descriptionForm = useRef(null)
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth() || { username: null, admin: null };

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <a href="#" style={{ fontSize: "small", margin: "3px" }}>{children}</a>
    </OverlayTrigger>
  );

  const handleDeleteClick = (name) => {
    if (window.confirm("Delete " + name + "?")) {
      fetch(url + "/llms/" + name, {
        method: 'DELETE',
        headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth })
      }).then(() => fetchLLMS()
      ).catch(err => {
        setError([...error, { "functionName": "handleDeleteClick", "error": err.toString() }]);
      });
    }
  }

  const fetchLLMS = () => {
    return fetch(url + "/llms", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => setData(d)
      ).catch(err => {
        setError([...error, { "functionName": "fetchLLMS", "error": err.toString() }]);
      });
  }

  const onSubmitHandler = (event) => {
    event.preventDefault();
    fetch(url + "/llms", {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
      body: JSON.stringify({
        "name": nameForm.current.value,
        "class_name": classnameForm.current.value,
        "options": optionsForm.current.value,
        "privacy": privacyForm.current.value,
        "type": typeForm.current.value,
        "description": descriptionForm.current.value
      }),
    })
      .then(response => response.json())
      .then(() => {
        fetchLLMS();
      }).catch(err => {
        setError([...error, { "functionName": "onSubmitHandler", "error": err.toString() }]);
      });

  }

  useEffect(() => {
    document.title = 'LLMs';
    fetchLLMS();
  }, []);

  return user.admin ? (
    <>
      {error.length > 0 &&
        <Alert variant="danger" style={{ textAlign: "center" }}>
          {JSON.stringify(error)}
        </Alert>
      }
      <Container style={{ marginTop: "20px" }}>
        <Row>
          <h1>Users</h1>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Class</th>
                <th>Privacy</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                data.map((llm, index) => {
                  return (
                    <tr key={index}>
                      <td>{index}</td>
                      <td>
                        <NavLink
                          to={"/llms/" + llm.username}
                        >
                          {llm.name}
                        </NavLink>
                      </td>
                      <td>
                        {llm.class_name}
                      </td>
                      <td>
                        {llm.privacy}
                      </td>
                      <td>
                        {llm.type}
                      </td>
                      <td>
                        <NavLink
                          to={"/llms/" + llm.name}
                        >
                          <Button variant="dark">View</Button>{' '}
                        </NavLink>
                        <Button onClick={() => handleDeleteClick(llm.name)} variant="danger">Delete</Button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </Row>
        <hr />
        <Row>
          <h1>Add LLM</h1>
          <Form onSubmit={onSubmitHandler}>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridUserName">
                <Form.Label>Name</Form.Label>
                <Form.Control ref={nameForm} />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridUserName">
                <Form.Label>Class Name</Form.Label>
                <Form.Control ref={classnameForm} />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridType">
                <Form.Label>Privacy<Link title="LLM privacy. Pick public for public cloud, private if the LLM is local.">ℹ️</Link></Form.Label>
                <Form.Select ref={privacyForm}>
                  <option>Choose...</option>
                  <option key="public">public</option>
                  <option key="private">private</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} controlId="formGridType">
                <Form.Label>Type<Link title="LLM type. QA for question/answer only, chat if it supports chat mode additionally to qa. Vision for image based LLMs.">ℹ️</Link></Form.Label>
                <Form.Select ref={typeForm}>
                  <option>Choose...</option>
                  <option key="qa">qa</option>
                  <option key="chat">chat</option>
                  <option key="vision">vision</option>
                </Form.Select>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridUserName">
                <Form.Label>Options</Form.Label>
                <Form.Control ref={optionsForm} />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridUserName">
                <Form.Label>Description</Form.Label>
                <Form.Control ref={descriptionForm} />
              </Form.Group>
            </Row>
            <Button variant="dark" type="submit" className="mb-2">
              Submit
            </Button>
          </Form>
        </Row>
      </Container>
    </>
  ) : (
    <Navigate to="/" />
  );
}

export default LLMs;