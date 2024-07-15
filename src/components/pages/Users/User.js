import { Container, Table, Row, Form, Col, Button, ListGroup } from 'react-bootstrap';
import { useParams, NavLink } from "react-router-dom";
import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { toast } from 'react-toastify';
import { AiOutlineDisconnect } from "react-icons/ai";
import { PiPencilLight } from "react-icons/pi";
import { MdInfoOutline, MdOutlineCheck, MdOutlinePerson } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { HiOutlineServerStack } from "react-icons/hi2";


function User() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const projectForm = useRef(null)
  const [data, setData] = useState({ projects: [] });
  const [projects, setProjects] = useState([]);
  var { username } = useParams();
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth() || { username: null, admin: null };

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  const fetchUser = (username) => {
    return fetch(url + "/users/" + username, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => setData(d)
      ).catch(err => {
        console.log(err.toString())
        toast.error("Error fetching user");
      });
  }

  const fetchProjects = () => {
    return fetch(url + "/projects", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => setProjects(d.projects)
      ).catch(err => {
        console.log(err.toString())
        toast.error("Error fetching projects");
      });
  }

  const apikeyClick = () => {
    if (window.confirm("This will invalidate your current API Key and generate a new one. Are you sure?")) {
      fetch(url + "/users/" + username + "/apikey", {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth })
      })
        .then(function (response) {
          if (!response.ok) {
            response.json().then(function (data) {
              toast.error(data.detail);
            });
            throw Error(response.statusText);
          } else {
            return response.json();
          }
        })
        .then((response) => {
          if (response) {
            alert(response.api_key);
          } else {
            alert("No key...");
          }
        }).catch(err => {
          toast.error(err.toString());
        });
    }
  }

  const handleRemoveClick = (projectName) => {
    var projectsi = [];
    for (var i = 0; i < data.projects.length; i++) {
      if (data.projects[i].name !== projectName) {
        projectsi.push(data.projects[i].name);
      }
    }

    fetch(url + "/users/" + username, {
      method: 'PATCH',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
      body: JSON.stringify({
        "projects": projectsi
      }),
    })
      .then(response => fetchUser(username))
      .catch(err => {
        toast.error(err.toString());
      });
  }

  const onSubmitHandler = (event) => {
    event.preventDefault();

    var projectsi = [];
    for (var i = 0; i < data.projects.length; i++) {
      projectsi.push(data.projects[i].name);
    }

    projectsi.push(projectForm.current.value)

    fetch(url + "/users/" + username, {
      method: 'PATCH',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
      body: JSON.stringify({
        "projects": projectsi
      }),
    })
      .then(response => fetchUser(username))
      .catch(err => {
        toast.error(err.toString());
      });
  }

  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RestAI") + ' - User - ' + username;
    fetchUser(username);
    fetchProjects();
  }, [username]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Row style={{ marginTop: "20px" }}>
          <Col sm={12}>
            <h1>
              <MdOutlinePerson size="1.5em" /> User Details ({data.username})
            </h1>
          </Col>
        </Row>
        <Row style={{marginBottom: "10px"}}>
          <Col sm={12}>
            <NavLink to={"/users/" + data.username + "/edit"} >
              <Button variant="dark" style={{ marginLeft: "5px" }}><PiPencilLight size="1.3em" /> Edit</Button>
            </NavLink>
            <Button variant="dark" style={{ marginLeft: "5px" }} onClick={() => apikeyClick()}><HiOutlineServerStack size="1.3em"/> Generate API Key</Button>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <ListGroup>
              <ListGroup.Item><b>Id:</b> {data.id}</ListGroup.Item>
              <ListGroup.Item><b>Username:</b> {data.username}</ListGroup.Item>
              <ListGroup.Item><b>Projects:</b> {data.projects.length}</ListGroup.Item>
              <ListGroup.Item><b>Admin:</b> {data.is_admin ? (<span><MdOutlineCheck size="1.3em" /></span>) : (<span><RxCross2 size="1.3em" /></span>)}</ListGroup.Item>
              <ListGroup.Item><b>Private models only:</b> {data.is_private ? (<span><MdOutlineCheck size="1.3em" /></span>) : (<span><RxCross2 size="1.3em" /></span>)}</ListGroup.Item>
              <ListGroup.Item><b>Auth:</b> {data.sso ? (data.sso) : ("local")}</ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
        <Row style={{ marginTop: "20px" }}>
          <hr />
          <h1>Projects</h1>
          {user.admin && (
            <Form onSubmit={onSubmitHandler}>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridProjects">
                  <Form.Label>Project<Link title="Allow this user to access this project"><MdInfoOutline size="1.4em" /></Link></Form.Label>
                  <Form.Select ref={projectForm} defaultValue="">
                    <option>Choose...</option>
                    {
                      projects.map((project, index) => {
                        return (
                          <option key={index}>{project.name}</option>
                        )
                      })
                    }
                  </Form.Select>
                </Form.Group>
              </Row>
              <Button variant="dark" type="submit" className="mb-2">
                Associate
              </Button>
            </Form>
          )}
          <hr />
          <h1>List</h1>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                data.projects.map((project, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <NavLink
                          to={"/projects/" + project.name}
                        >
                          {project.name}
                        </NavLink>
                      </td>
                      <td>
                        <Button onClick={() => handleRemoveClick(project.name)} variant="danger"><AiOutlineDisconnect size="1.3em" /> Dissociate</Button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </Row>
      </Container >
    </>
  );
}

export default User;