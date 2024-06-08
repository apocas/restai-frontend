import { Container, Table, Row, Form, Col, Button } from 'react-bootstrap';
import { NavLink } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { toast } from 'react-toastify';
import { MdOutlineImage, MdOutlineChat, MdInfoOutline } from "react-icons/md";
import { FaRegPaperPlane } from "react-icons/fa";
import { PiMagnifyingGlassPlus } from "react-icons/pi";
import Badge from 'react-bootstrap/Badge';
import { IoLibraryOutline } from "react-icons/io5";

function Library() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState([]);
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  const fetchProjects = () => {
    const baseUrl = url ? url : window.location.origin;
    const urlWithParams = new URL("/projects", baseUrl);
    urlWithParams.searchParams.append('filter', 'public');

    return fetch(urlWithParams, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
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
      .then((d) => {
        setData(d.projects)
      }
      ).catch(err => {
        toast.error(err.toString());
      });
  }

  useEffect(() => {
    document.title = 'RESTAI - Library';
    fetchProjects();
  }, []);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1><IoLibraryOutline size="1.3em" /> Projects Library</h1>
        <Row>
          <Col sm={12}>
            Public library, projects shared with all logged-in users.
          </Col>
        </Row>
        <Row style={{ marginTop: "10px" }}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: "370px" }}>Actions<Link title="Chat has memory. Question doesn't"><MdInfoOutline size="1.4em" /></Link></th>
              </tr>
            </thead>
            <tbody>
              {
                data.map((project, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <NavLink
                          to={"/projects/" + project.name}
                        >
                          {project.human_name || project.name}&nbsp;
                          {
                            (() => {
                              switch (project.type) {
                                case 'rag':
                                  return <Badge bg="primary">{project.type}</Badge>;
                                case 'ragsql':
                                  return <Badge bg="secondary">{project.type}</Badge>;
                                case 'vision':
                                  return <Badge bg="success">{project.type}</Badge>;
                                case 'inference':
                                  return <Badge bg="warning">{project.type}</Badge>;
                                default:
                                  return <Badge bg="dark">{project.type}</Badge>;
                              }
                            })()
                          }
                        </NavLink>
                      </td>
                      <td>
                        <span style={{ whiteSpace: "pre-line" }}>{project.human_description}</span>
                      </td>
                      <td>
                        <Row>
                          <Col sm={4} style={{ textAlign: "left" }}>
                            <NavLink
                              to={"/projects/" + project.name}
                            >
                              <Button variant="dark"><PiMagnifyingGlassPlus size="1.2em" /> Details</Button>{' '}
                            </NavLink>
                          </Col>
                          <Col sm={8} style={{ textAlign: "right" }}>
                            {project.type === "vision" &&
                              <NavLink
                                to={"/projects/" + project.name + "/multimodal"}
                              >
                                <Button variant="success"><MdOutlineImage size="1.3em" /> Question</Button>{' '}
                              </NavLink>
                            }
                            {(project.type === "rag" || project.type === "agent") &&
                              <NavLink
                                to={"/projects/" + project.name + "/chat"}
                              >
                                <Button variant="success"><MdOutlineChat size="1.3em" /> Chat</Button>{' '}
                              </NavLink>
                            }
                            {project.type === "ragsql" &&
                              <NavLink
                                to={"/projects/" + project.name + "/multimodal"}
                              >
                                <Button variant="success"><FaRegPaperPlane size="1.1em" /> Question</Button>{' '}
                              </NavLink>
                            }
                            {(project.type === "inference") &&
                              <NavLink
                                to={"/projects/" + project.name + "/multimodal"}
                              >
                                <Button variant="success"><FaRegPaperPlane size="1.1em" /> Question</Button>{' '}
                              </NavLink>
                            }
                            {(project.type === "router") &&
                              <NavLink
                                to={"/projects/" + project.name + "/multimodal"}
                              >
                                <Button variant="success"><FaRegPaperPlane size="1.1em" /> Multimodal</Button>{' '}
                              </NavLink>
                            }
                          </Col>
                        </Row>
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

export default Library;