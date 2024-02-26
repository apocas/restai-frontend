import { Container, Table, Row, Form, Col, Button } from 'react-bootstrap';
import { NavLink, Navigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { toast } from 'react-toastify';
import { PiMagnifyingGlassPlus } from "react-icons/pi";
import { MdOutlineDelete, MdInfoOutline } from "react-icons/md";
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import { PiBrain } from "react-icons/pi";
import { FiFilePlus, FiPlus } from "react-icons/fi";

function LLMs() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState([]);
  const nameForm = useRef(null)
  const classnameForm = useRef(null)
  const optionsForm = useRef(null)
  const privacyForm = useRef(null)
  const typeForm = useRef(null)
  const descriptionForm = useRef(null)
  const privacyFilter = useRef(null)
  const [displayData, setDisplayData] = useState([]);
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth() || { username: null, admin: null };
  const [show, setShow] = useState(false);

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span href="#" style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCreate = () => {
    onSubmitHandler();
    handleClose();
  }

  const handleDeleteClick = (name) => {
    if (window.confirm("Delete " + name + "?")) {
      fetch(url + "/llms/" + name, {
        method: 'DELETE',
        headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth })
      }).then(() => fetchLLMS()
      ).catch(err => {
        console.log(err.toString());
        toast.error("Error deleting LLM");
      });
    }
  }

  const fetchLLMS = () => {
    return fetch(url + "/llms", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setDisplayData(d)
      }).catch(err => {
        console.log(err.toString());
        toast.error("Error fetching LLMs");
      });
  }

  const onSubmitHandler = (event) => {
    if (event)
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
        toast.error(err.toString());
      });
  }

  const handleFilterChange = () => {
    var newData = [];
    var privacyFilterValue = privacyFilter.current.value;
    if (privacyFilterValue === "All") {
      newData = [...data];
      setDisplayData(newData);
    } else {
      newData = data.filter(element => element.privacy === privacyFilterValue)
      setDisplayData(newData);
    }
  }

  useEffect(() => {
    document.title = 'LLMs';
    fetchLLMS();
  }, []);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Row>
          <h1><PiBrain size="1.3em" /> LLMs</h1>
          <Row style={{ marginBottom: "10px" }}>
            <Col sm={3}>
              <Form.Group as={Col} controlId="formGridLLM">
                <Form.Label>Privacy</Form.Label>
                <Form.Select ref={privacyFilter} onChange={handleFilterChange} defaultValue="All">
                  <option>All</option>
                  {
                    ["public", "private"].map((type, index) => {
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
                <FiPlus size="1.3em" /> New LLM
              </Button>
            </Col>
          </Row>
          <Row>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Privacy</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  displayData.map((llm, index) => {
                    return (
                      <tr key={index}>
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
                          {
                            (() => {
                              switch (llm.privacy) {
                                case 'public':
                                  return <Badge bg="danger">{llm.privacy}</Badge>;
                                case 'private':
                                  return <Badge bg="success">{llm.privacy}</Badge>;
                                default:
                                  return <Badge bg="dark">{llm.privacy}</Badge>;
                              }
                            })()
                          }
                        </td>
                        <td>
                          {
                            (() => {
                              switch (llm.type) {
                                case 'chat':
                                  return <Badge bg="primary">{llm.type}</Badge>;
                                case 'qa':
                                  return <Badge bg="secondary">{llm.type}</Badge>;
                                case 'vision':
                                  return <Badge bg="success">{llm.type}</Badge>;
                                default:
                                  return <Badge bg="dark">{llm.type}</Badge>;
                              }
                            })()
                          }
                        </td>
                        <td>
                          <Row>
                            <Col sm={6} style={{ textAlign: "left" }}>
                              <NavLink
                                to={"/llms/" + llm.name}
                              >
                                <Button variant="dark"><PiMagnifyingGlassPlus size="1.2em" /> Details</Button>
                              </NavLink>
                            </Col>
                            {user.admin &&
                              <Col sm={6} style={{ textAlign: "right" }}>
                                <Button onClick={() => handleDeleteClick(llm.name)} variant="danger"><MdOutlineDelete size="1.3em" /> Delete</Button>
                              </Col>
                            }
                          </Row>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
          </Row>
        </Row>
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title><FiFilePlus size="1.3em" /> New LLM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridType">
                <Form.Label>Privacy<Link title="LLM privacy. Pick public for public cloud, private if the LLM is local."><MdInfoOutline size="1.4em" /></Link></Form.Label>
                <Form.Select ref={privacyForm}>
                  <option>Choose...</option>
                  <option key="public">public</option>
                  <option key="private">private</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} controlId="formGridType">
                <Form.Label>Type<Link title="LLM type. QA for question/answer only, chat if it supports chat mode additionally to qa. Vision for image based LLMs."><MdInfoOutline size="1.4em" /></Link></Form.Label>
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
  );
}

export default LLMs;