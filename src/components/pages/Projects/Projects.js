import { Container, Table, Row, Form, Col, Button } from 'react-bootstrap';
import { NavLink } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { toast } from 'react-toastify';
import { MdOutlineImage, MdOutlineChat, MdInfoOutline } from "react-icons/md";
import { FaRegPaperPlane } from "react-icons/fa";
import { PiMagnifyingGlassPlus, PiFilePlus } from "react-icons/pi";


function Projects() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [users, setUsers] = useState({ "teste": [] });
  const [info, setInfo] = useState({ "version": "", "embeddings": [], "llms": [], "loaders": [] });
  const projectNameForm = useRef(null)
  const embbeddingForm = useRef(null)
  const typeForm = useRef(null)
  const llmForm = useRef(null)
  const [availableLLMs, setAvailableLLMs] = useState([]);
  const [type, setType] = useState("");
  const vectorForm = useRef(null)
  const embbeddingFilter = useRef(null)
  const llmFilter = useRef(null)
  const vectorFilter = useRef(null)
  const typeFilter = useRef(null)
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  const fetchProjects = () => {
    return fetch(url + "/projects", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
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
        setData(d)
        setDisplayData(d)
        if (user.admin)
          fetchUsers(d);
      }
      ).catch(err => {
        toast.error(err.toString());
      });
  }

  const fetchInfo = () => {
    return fetch(url + "/info", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
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
      .then((d) => setInfo(d)
      ).catch(err => {
        toast.error(err.toString());
      });
  }

  const fetchUsers = (data) => {
    return fetch(url + "/users", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
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
        var arr = {};
        for (let i = 0; i < data.length; i++) {
          arr[data[i].name] = []
          for (let j = 0; j < d.length; j++) {
            for (let z = 0; z < d[j].projects.length; z++) {
              if (data[i].name === d[j].projects[z].name)
                arr[data[i].name].push(d[j].username);
            }
          }
        }
        setUsers(arr)
      }
      ).catch(err => {
        toast.error(err.toString());
      });
  }

  const handleFilterChange = () => {
    var newData = [];
    var embFilterValue = embbeddingFilter.current.value;
    var llmFilterValue = llmFilter.current.value;
    var vectorFilterValue = vectorFilter.current.value;
    var typeFilterValue = typeFilter.current.value;
    if (embFilterValue === "All" && llmFilterValue === "All" && vectorFilterValue === "All" && typeFilterValue === "All") {
      newData = [...data];
      setDisplayData(newData);
    } else {
      newData = data.filter(element => element.embeddings === embFilterValue || element.llm === llmFilterValue || element.vectorstore === vectorFilterValue || element.type === typeFilterValue)
      setDisplayData(newData);
    }
  }

  // TODO: response handling
  const onSubmitHandler = (event) => {
    event.preventDefault();

    var opts = {
      "name": projectNameForm.current.value,
      "llm": llmForm.current.value,
      "type": typeForm.current.value
    }

    if (type === "rag") {
      opts.embeddings = embbeddingForm.current.value;
      opts.vectorstore = vectorForm.current.value;
    }

    fetch(url + "/projects", {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
      body: JSON.stringify(opts),
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
        //fetchProjects()
        window.location = "/admin/projects/" + response.project
      }).catch(err => {
        toast.error(err.toString());
      });

  }

  const createSelectItems = () => {
    let items = [];
    for (let index = 0; index < availableLLMs.length; index++) {
      let llm = availableLLMs[index];
      items.push(<option key={index}>{llm}</option>);
    }
    return items;
  }

  const typeChange = () => {
    var type = typeForm.current.value;
    setType(type);
    if (type === "rag" || type === "inference" || type === "ragsql") {
      setAvailableLLMs(info.llms.filter(llm => llm.type === "qa" || llm.type === "chat").map(llm => llm.name));

    } else if (type === "vision") {
      setAvailableLLMs(info.llms.filter(llm => llm.type === "vision").map(llm => llm.name));
    }
  }

  useEffect(() => {
    document.title = 'Projects';
    fetchProjects();
    fetchInfo();
  }, []);

  useEffect(() => {
    //...
  }, [type]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1>Projects</h1>
        <Row style={{ marginBottom: "10px" }}>
          <Col sm={3}>
            <Form.Group as={Col} controlId="formGridLLM">
              <Form.Label>LLM</Form.Label>
              <Form.Select ref={llmFilter} onChange={handleFilterChange} defaultValue="All">
                <option>All</option>
                {
                  info.llms.map((llm, index) => {
                    return (
                      <option key={index}>{llm.name}</option>
                    )
                  }
                  )
                }
              </Form.Select>
            </Form.Group>
          </Col>
          <Col sm={3}>
            <Form.Group as={Col} controlId="formGridLLM">
              <Form.Label>Type</Form.Label>
              <Form.Select ref={typeFilter} onChange={handleFilterChange} defaultValue="All">
                <option>All</option>
                {
                  ["rag", "ragsql", "vision", "inference"].map((type, index) => {
                    return (
                      <option key={index}>{type}</option>
                    )
                  })
                }
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Project Name</th>
                <th>Type</th>
                <th>Model</th>
                <th>Actions</th>
                <th>Inference<Link title="Chat has memory. Question doesn't"><MdInfoOutline size="1.4em"/></Link></th>
                {user.admin &&
                  <th>Used by</th>
                }
              </tr>
            </thead>
            <tbody>
              {
                displayData.map((project, index) => {
                  return (
                    <tr key={index}>
                      <td>{index}</td>
                      <td>
                        <NavLink
                          to={"/projects/" + project.name}
                        >
                          {project.name}
                        </NavLink>
                      </td>
                      <td>
                        {project.type}
                      </td>
                      <td>
                        {project.llm}
                      </td>
                      <td>
                        <NavLink
                          to={"/projects/" + project.name}
                        >
                          <Button variant="dark"><PiMagnifyingGlassPlus size="1.2em" /> View</Button>{' '}
                        </NavLink>
                      </td>
                      <td>
                        {project.type === "vision" &&
                          <NavLink
                            to={"/projects/" + project.name + "/vision"}
                          >
                            <Button variant="success"><MdOutlineImage size="1.3em" /> Vision</Button>{' '}
                          </NavLink>
                        }
                        {project.type === "rag" && project.llm_type === "chat" &&
                          <NavLink
                            to={"/projects/" + project.name + "/chat"}
                          >
                            <Button variant="success"><MdOutlineChat size="1.3em" /> Chat</Button>{' '}
                          </NavLink>
                        }
                        {project.type === "rag" &&
                          <NavLink
                            to={"/projects/" + project.name + "/question"}
                          >
                            <Button variant="success"><FaRegPaperPlane size="1.1em" /> Question</Button>{' '}
                          </NavLink>
                        }
                        {project.type === "ragsql" &&
                          <NavLink
                            to={"/projects/" + project.name + "/questionsql"}
                          >
                            <Button variant="success"><FaRegPaperPlane size="1.1em" /> Question</Button>{' '}
                          </NavLink>
                        }
                        {project.type === "inference" &&
                          <NavLink
                            to={"/projects/" + project.name + "/inference"}
                          >
                            <Button variant="success"><FaRegPaperPlane size="1.1em" /> Question</Button>{' '}
                          </NavLink>
                        }
                      </td>
                      {
                        user.admin &&
                        <td>
                          {typeof users[project.name] !== "undefined" && (
                            users[project.name].map((user, index) => {
                              if (users[project.name].length - 1 === index)
                                return <NavLink key={index} to={"/users/" + user}>{user}</NavLink>
                              return <NavLink key={index} to={"/users/" + user}>{user + ", "}</NavLink>
                            })
                          )
                          }
                        </td>
                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </Row>
        <hr />
        <Row>
          <h1>New Project</h1>
          <Form onSubmit={onSubmitHandler}>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridProjectName">
                <Form.Label>Project Name</Form.Label>
                <Form.Control ref={projectNameForm} />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridType">
                <Form.Label>Project Type<Link title="Project type. RAG for text retrieval augmented generation. RAGSQL for SQL retrieval augmented generation. Inference for pure inference without embedddings. Vision for image based models/inference."><MdInfoOutline size="1.4em"/></Link></Form.Label>
                <Form.Select ref={typeForm} onChange={typeChange}>
                  <option>Choose...</option>
                  <option key="rag">rag</option>
                  <option key="ragsql">ragsql</option>
                  <option key="inference">inference</option>
                  <option key="vision">vision</option>
                </Form.Select>
              </Form.Group>
              {type === "rag" &&
                <Form.Group as={Col} controlId="formGridEmbeddings">
                  <Form.Label>Embeddings<Link title="Model used to compute embeddings"><MdInfoOutline size="1.4em"/></Link></Form.Label>
                  <Form.Select ref={embbeddingForm} defaultValue="">
                    <option>Choose...</option>
                    {
                      info.embeddings.map((embbedding, index) => {
                        return (
                          <option key={index}>{embbedding.name}</option>
                        )
                      })
                    }
                  </Form.Select>
                </Form.Group>
              }

              <Form.Group as={Col} controlId="formGridLLM">
                <Form.Label>LLM</Form.Label>
                <Form.Select ref={llmForm} defaultValue="">
                  {createSelectItems()}
                </Form.Select>
              </Form.Group>

              {type === "rag" &&
                <Form.Group as={Col} controlId="formGridVector">
                  <Form.Label>Vectorstore<Link title="Chroma is monolithic and only recommended for testing. Redis is distributed."><MdInfoOutline size="1.4em"/></Link></Form.Label>
                  <Form.Select ref={vectorForm} defaultValue="redis">
                    <option>redis</option>
                    <option>chroma</option>
                  </Form.Select>
                </Form.Group>
              }
            </Row>
            <Button variant="dark" type="submit" className="mb-2">
              <PiFilePlus size="1.3em"/> Create
            </Button>
          </Form>
        </Row>
      </Container >
    </>
  );
}

export default Projects;