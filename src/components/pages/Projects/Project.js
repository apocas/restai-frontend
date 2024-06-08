import { Container, Table, Row, Form, Col, Button, ListGroup, Badge, Tab, Tabs, Spinner } from 'react-bootstrap';
import { NavLink, useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import ReactJson from '@microlink/react-json-view';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { WithContext as ReactTags } from 'react-tag-input';
import Card from 'react-bootstrap/Card';
import { toast } from 'react-toastify';
import { MdOutlineImage, MdOutlineChat, MdInfoOutline, MdOutlineDelete, MdOutlineCheck } from "react-icons/md";
import { FaRegPaperPlane } from "react-icons/fa";
import { PiMagnifyingGlassPlus, PiFileArrowUpLight, PiPencilLight } from "react-icons/pi";
import { GrPowerReset } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";
import Modal from 'react-bootstrap/Modal';

function Project() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [info, setInfo] = useState({ "version": "", "embeddings": [], "llms": [], "loaders": [] });
  const [data, setData] = useState({});
  const [embeddings, setEmbeddings] = useState({ embeddings: [] });
  const [chunks, setChunks] = useState([]);
  const [file, setFile] = useState(null);
  const contentForm = useRef(null)
  const contentNameForm = useRef(null)
  const [embedding, setEmbedding] = useState(null);
  const [chunk, setChunk] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const urlForm = useRef(null);
  const ref = useRef(null);
  const fileForm = useRef(null);
  var { projectName } = useParams();
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();
  const [tags, setTags] = React.useState([]);
  const typeForm = useRef(null)
  const splitterForm = useRef(null)
  const chunksForm = useRef(null)
  const searchForm = useRef(null)
  const kSearchForm = useRef(null)
  const thresholdSearchForm = useRef(null)
  const [show, setShow] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [projects, setProjects] = useState([]);
  const routeProjectForm = useRef(null)
  const routeNameForm = useRef(null)
  const routeDescriptionForm = useRef(null)

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCloseRoute = () => setShowRoute(false);
  const handleShowRoute = () => setShowRoute(true);

  const handleCreate = () => {
    onSubmitHandler();
  }

  const deleteRouteClick = (routeName) => {
    if (window.confirm("Delete " + routeName + "?")) {
      data.entrances = data.entrances.filter((entrance) => entrance.name !== routeName);
      saveEntrances();
    }
  }


  const handleCreateEntrance = () => {
    data.entrances.push({
      "name": routeNameForm.current.value,
      "description": routeDescriptionForm.current.value,
      "destination": routeProjectForm.current.value
    });
    saveEntrances();
  }

  const saveEntrances = () => {
    if (canSubmit) {
      setCanSubmit(false);
      var opts = {
        "entrances": data.entrances
      }

      fetch(url + "/projects/" + projectName, {
        method: 'PATCH',
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
        .then(() => {
          setCanSubmit(true);
          window.location.href = "/admin/projects/" + projectName;
        }).catch(err => {
          setCanSubmit(true);
          toast.error(err.toString());
        });
    }
  }

  const showResponse = (uploadResponse) => {
    var perc = parseFloat((data.k * 100) / uploadResponse.chunks).toFixed(1);
    if (perc > 100) perc = 100;

    var details = uploadResponse.chunks + " chunks and " + uploadResponse.documents + " documents created.";
    toast.success(details);
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

  const onSubmitSearchHandler = (event) => {
    event.preventDefault();

    var data = {}
    if (typeForm.current.value === "text") {
      data.text = searchForm.current.value
      data.k = kSearchForm.current.value
      data.score = thresholdSearchForm.current.value
    } else if (typeForm.current.value === "source") {
      data.source = searchForm.current.value
    }

    fetch(url + "/projects/" + projectName + "/embeddings/search", {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
      body: JSON.stringify(data),
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
        setChunk(null);
        if (response.embeddings.length === 0) {
          toast.warning("No embeddings found for this query. Decrease the score cutoff parameter.");
        }
        setChunks(response.embeddings);
      }).catch(err => {
        toast.error(err.toString());
      });

  }

  const handleDeleteProjectClick = (projectName) => {
    if (window.confirm("Delete " + projectName + "?")) {
      fetch(url + "/projects/" + projectName, { method: 'DELETE', headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
        .then(function (response) {
          if (!response.ok) {
            response.json().then(function (data) {
              toast.error(data.detail);
            });
            throw Error(response.statusText);
          } else {
            window.location = "/admin"
          }
        })
        .catch(err => {
          toast.error(err.toString());
        });
    }
  }

  const fetchProject = (projectName) => {
    return fetch(url + "/projects/" + projectName, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        return d
      }).catch(err => {
        toast.error(err.toString());
      });
  }

  const fetchEmbeddings = (projectName) => {
    setEmbeddings({ "embeddings": [] });
    if (data.type === "rag" && (data.chunks < 30000 || !data.chunks)) {
      return fetch(url + "/projects/" + projectName + "/embeddings", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
        .then((res) => res.json())
        .then((d) => setEmbeddings(d)
        ).catch(err => {
          toast.error(err.toString());
        });
    }
  }

  const handleDeleteClick = (source) => {
    if (window.confirm("Delete " + source + "?")) {
      fetch(url + "/projects/" + projectName + "/embeddings/" + btoa(source),
        {
          method: 'DELETE', headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth })
        }).then(() => {
          fetchProject(projectName);
          fetchEmbeddings(projectName);
        }).catch(err => {
          toast.error(err.toString());
        });
    }
  }

  const handleResetEmbeddingsClick = () => {
    if (window.confirm("Reset " + projectName + " embeddings?")) {
      fetch(url + "/projects/" + projectName + "/embeddings/reset",
        {
          method: 'POST', headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth })
        }).then(() => {
          fetchProject(projectName);
          fetchEmbeddings(projectName);
        }).catch(err => {
          toast.error(err.toString());
        });
    }
  }

  const handleViewClick = (source) => {
    fetch(url + "/projects/" + projectName + "/embeddings/source/" + btoa(source), {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
    })
      .then(response => response.json())
      .then(response => {
        response.source = source;
        setEmbedding(response);
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }).catch(err => {
        toast.error(err.toString());
      });
  }

  const clearButton = () => {
    searchForm.current.value = "";
    setChunks([]);
    setChunk(null);
  }

  const handleChunkViewClick = (id) => {
    fetch(url + "/projects/" + projectName + "/embeddings/id/" + id, {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
    })
      .then(response => response.json())
      .then(response => {
        setChunk(response);
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }).catch(err => {
        toast.error(err.toString());
      });
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      var f = e.target.files[0];
      setFile(f);
    }
  };

  const resetFileInput = () => {
    setFile(null);
    fileForm.current.value = null;
  };

  const handleDelete = i => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = tag => {
    setTags([...tags, tag]);
  };


  const onSubmitHandler = (event) => {
    if (event)
      event.preventDefault();

    if (canSubmit) {
      setCanSubmit(false);
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("splitter", splitterForm.current.value);
        formData.append("chunks", chunksForm.current.value);

        fetch(url + "/projects/" + projectName + "/embeddings/ingest/upload", {
          method: 'POST',
          headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }),
          body: formData,
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
            resetFileInput();
            showResponse(response);
            fetchProject(projectName);
            fetchEmbeddings(projectName);
            setCanSubmit(true);
          }).catch(err => {
            toast.error(err.toString());
            setCanSubmit(true);
          }).finally(() => {
            handleClose();
          });
      } else if (urlForm.current.value !== "") {
        var ingestUrl = urlForm.current.value;
        var body = {};

        body = {
          "url": ingestUrl,
          "splitter": splitterForm.current.value,
          "chunks": chunksForm.current.value
        }

        fetch(url + "/projects/" + projectName + "/embeddings/ingest/url", {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
          body: JSON.stringify(body),
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
            urlForm.current.value = "";
            showResponse(response);
            fetchProject(projectName);
            fetchEmbeddings(projectName);
            setCanSubmit(true);
          }).catch(err => {
            toast.error(err.toString());
            setCanSubmit(true);
          }).finally(() => {
            handleClose();
          });
      } else if (contentForm.current.value !== "") {
        var body = {
          "text": contentForm.current.value,
          "source": contentNameForm.current.value,
          "splitter": splitterForm.current.value,
          "chunks": chunksForm.current.value
        }

        if (tags.length > 0) {
          body.keywords = tags.map((tag) => tag.text);
        }

        fetch(url + "/projects/" + projectName + "/embeddings/ingest/text", {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
          body: JSON.stringify(body),
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
            showResponse(response);
            fetchProject(projectName);
            fetchEmbeddings(projectName);
            setCanSubmit(true);
            contentNameForm.current.value = "";
            contentForm.current.value = "";
            setTags([]);
          }).catch(err => {
            toast.error(err.toString());
            setCanSubmit(true);
          }).finally(() => {
            handleClose();
          });
      }
    }
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

  const checkPrivacy = () => {
    var embbeddingPrivacy = true;
    info.embeddings.forEach(function (element) {
      if (element.name === data.embeddings && element.privacy === "public")
        embbeddingPrivacy = false;
    })
    if (embbeddingPrivacy && data.llm_privacy === "private") {
      return true;
    } else {
      return false;
    }
  }

  useEffect(() => {
    document.title = 'RESTAI - Project - ' + projectName;
    fetchProject(projectName);
    fetchInfo();
  }, [projectName]);

  useEffect(() => {
    fetchEmbeddings(projectName);
    fetchProjects();
  }, [data])

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Row style={{ marginTop: "20px" }}>
          <Col sm={12}>
            <h1><PiMagnifyingGlassPlus size="1.2em" /> Project Details ({data.name})</h1>
          </Col>
        </Row>
        {(data.level === "own") &&
          <Row style={{ marginBottom: "10px" }}>

            <Col sm={6} style={{ textAlign: "left" }}>
              <Button onClick={() => handleDeleteProjectClick(data.name)} variant="danger"><MdOutlineDelete size="1.3em" /> Delete</Button>
              <NavLink
                to={"/projects/" + data.name + "/edit"}
              >
                <Button variant="dark" style={{ marginLeft: "5px" }}><PiPencilLight size="1.3em" /> Edit</Button>
              </NavLink>
            </Col>
            <Col sm={6} style={{ textAlign: "right" }}>
              {data.type === "router" &&
                <Button variant="primary" onClick={handleShowRoute}>
                  <PiFileArrowUpLight size="1.3em" /> Add Route
                </Button>
              }
              {data.type === "rag" &&
                <Button variant="primary" onClick={handleShow}>
                  <PiFileArrowUpLight size="1.3em" /> Ingest Data
                </Button>
              }
              {(data.type === "router") &&
                < NavLink
                  to={"/projects/" + data.name + "/multimodal"}
                  style={{ marginLeft: "5px" }}
                >
                  <Button variant="success"><MdOutlineImage size="1.3em" /> Multimodal</Button>
                </NavLink>
              }
              {data.type === "vision" &&
                < NavLink
                  to={"/projects/" + data.name + "/vision"}
                  style={{ marginLeft: "5px" }}
                >
                  <Button variant="success"><MdOutlineImage size="1.3em" /> Vision</Button>
                </NavLink>
              }
              {(data.type === "inference" || data.type === "agent") &&
                < NavLink
                  to={"/projects/" + data.name + "/inference"}
                  style={{ marginLeft: "5px" }}
                >
                  <Button variant="success"><FaRegPaperPlane size="1.1em" /> Question</Button>
                </NavLink>
              }
              {(data.type === "rag" || data.type === "agent") &&
                <NavLink
                  to={"/projects/" + data.name + "/chat"}
                  style={{ marginLeft: "5px" }}
                >
                  <Button variant="success"><MdOutlineChat size="1.3em" /> Chat</Button>
                </NavLink>
              }
              {(data.type === "rag" || data.type === "ragsql") &&
                <NavLink
                  to={"/projects/" + data.name + "/question"}
                  style={{ marginLeft: "5px" }}
                >
                  <Button variant="success"><FaRegPaperPlane size="1.1em" /> Question</Button>
                </NavLink>
              }
            </Col>
          </Row>
        }
        <Row>
          <Col sm={12}>
            <ListGroup>
              <ListGroup.Item><b>Privacy: </b>
                {checkPrivacy() ?
                  <Badge bg="success">Local AI <Link title="You are NOT SHARING any data with external entities."><MdInfoOutline size="1.4em" /></Link></Badge>
                  :
                  <Badge bg="danger">Public AI <Link title="You ARE SHARING data with external entities."><MdInfoOutline size="1.4em" /></Link></Badge>
                }
              </ListGroup.Item>
              <ListGroup.Item><b>Project: {data.name}</b></ListGroup.Item>
              <ListGroup.Item><b>LLM:</b> {data.llm}</ListGroup.Item>
              <ListGroup.Item><b>Name:</b> {data.human_name}</ListGroup.Item>
              {data.human_description && <ListGroup.Item><b>Description:</b> {data.human_description}</ListGroup.Item>}
              {data.guard && <ListGroup.Item><b>Guardian:</b> {data.guard}</ListGroup.Item>}
              {data.censorship && <ListGroup.Item><b>Sandbox Message:</b> {data.censorship}</ListGroup.Item>}

              {((data.type === "inference" || data.type === "rag" || data.type === "ragsql" || data.type === "agent") && data.system) &&
                <ListGroup.Item><b>System:</b> <span style={{ whiteSpace: "pre-line" }}>{data.system}</span></ListGroup.Item>
              }
              {(data.type === "agent" && data.tools) &&
                <ListGroup.Item><b>Tools:</b> {data.tools}</ListGroup.Item>
              }
              {(data.type === "ragsql" && data.connection) &&
                <ListGroup.Item><b>Connection:</b> {data.connection}</ListGroup.Item>
              }
              {(data.type === "ragsql" && data.tables) &&
                <ListGroup.Item><b>Tables:</b> {data.tables}</ListGroup.Item>
              }
              {data.type === "rag" &&
                <ListGroup.Item><b>Documents (chunks):</b> {data.chunks}</ListGroup.Item>
              }
              {data.type === "rag" &&
                <ListGroup.Item><b>Vectorstore:</b> {data.vectorstore}</ListGroup.Item>
              }
              {data.type === "rag" &&
                <ListGroup.Item><b>Embeddings:</b> {data.embeddings} {(data.level === "own") && <Button onClick={() => handleResetEmbeddingsClick()} variant="danger"><GrPowerReset size="1.3em" /> Reset</Button>}</ListGroup.Item>
              }
              {data.type === "rag" &&
                <ListGroup.Item><b>K:</b> {data.k}</ListGroup.Item>
              }
              {data.type === "rag" &&
                <ListGroup.Item><b>Score Cutoff:</b> {data.score}</ListGroup.Item>
              }
              {data.type === "rag" &&
                <ListGroup.Item><b>Colbert Rerank:</b> {data.colbert_rerank ? (<span><MdOutlineCheck size="1.3em" /></span>) : (<span><RxCross2 size="1.3em" /></span>)}</ListGroup.Item>
              }
              {data.type === "rag" &&
                <ListGroup.Item><b>LLM Rerank:</b> {data.llm_rerank ? (<span><MdOutlineCheck size="1.3em" /></span>) : (<span><RxCross2 size="1.3em" /></span>)}</ListGroup.Item>
              }
              {data.type === "rag" &&
                <ListGroup.Item><b>Cache:</b> {data.cache ? (<span><MdOutlineCheck size="1.3em" /></span>) : (<span><RxCross2 size="1.3em" /></span>)}({data.cache_threshold})</ListGroup.Item>
              }
            </ListGroup>
          </Col>
        </Row>
        {data.type === "router" &&
          <Row style={{ marginTop: "20px" }}>
            <hr />
            <h1>Routes<Link title="Ingested files and URLs"><MdInfoOutline size="1.4em" /></Link></h1>
            {
              data.entrances.map((entrance, index) => {
                return (
                  <Card style={{ width: '25rem', paddingLeft: '0px', paddingRight: '0px', marginLeft: '5px', marginTop: '5px' }}>
                    <Card.Header><b>Name: {entrance.name}</b></Card.Header>
                    <Card.Body>
                      <Card.Text>
                        {entrance.description}
                      </Card.Text>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                      <ListGroup.Item><b>Destination:</b> {entrance.destination}</ListGroup.Item>
                    </ListGroup>
                    <Card.Footer className="text-muted">
                      {(data.level === "own") &&
                        <Button onClick={() => deleteRouteClick(entrance.name)} variant="danger" style={{ marginLeft: '5px' }}>Delete</Button>
                      }
                    </Card.Footer>
                  </Card>
                )
              })
            }
          </Row>
        }
        {data.type === "rag" &&
          <Row style={{ marginTop: "20px" }}>
            <hr />
            <h1>Embeddings<Link title="Ingested files and URLs"><MdInfoOutline size="1.4em" /></Link></h1>

            <Tabs
              defaultActiveKey="documents"
              id="outputTabs"
            >
              <Tab eventKey="documents" title="Documents">
                <Row style={{ marginTop: "20px" }}>
                  <h3>Document List</h3>
                  {data.documents > 20000 && embeddings.embeddings.length === 0 ?
                    <Col sm={12}>
                      Too many embeddings to be listed, use the retrieval simulator.
                    </Col>
                    : (
                      <Col sm={12} style={embeddings.embeddings.length > 5 ? { height: "400px", overflowY: "scroll" } : {}}>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Source</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              embeddings.embeddings.map((emb, index) => {
                                return (
                                  <tr key={index}>
                                    <td>
                                      {emb}
                                    </td>
                                    <td>
                                      <Button onClick={() => handleViewClick(emb)} variant="dark"><PiMagnifyingGlassPlus size="1.2em" /> View</Button>{' '}
                                      {(data.level === "own") &&
                                        <Button onClick={() => handleDeleteClick(emb)} variant="danger"><MdOutlineDelete size="1.3em" /> Delete</Button>
                                      }
                                    </td>
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </Table>
                      </Col>
                    )}
                  {
                    embedding && (
                      <Row>
                        <Col sm={12}>
                          <h2 ref={ref}>Document ({embedding.source}):</h2>
                          <ListGroup style={{ height: "600px", overflowY: "scroll" }}>
                            <ListGroup.Item><b>IDS:</b> <ReactJson src={embedding.ids} enableClipboard={false} collapsed={0} /></ListGroup.Item>
                            <ListGroup.Item><b>Metadatas:</b> <ReactJson src={embedding.metadatas} enableClipboard={false} /></ListGroup.Item>
                            <ListGroup.Item><b>Documents:</b> <ReactJson src={embedding.documents} enableClipboard={false} /></ListGroup.Item>
                          </ListGroup>
                        </Col>
                      </Row>
                    )
                  }
                </Row>
              </Tab>
              <Tab eventKey="retrieval" title="Retrieval Simulator">
                <Row style={{ marginTop: "20px" }}>
                  <h3>Chunks</h3>

                  <Row style={{ marginTop: "20px" }}>
                    <Form onSubmit={onSubmitSearchHandler}>
                      <Col sm={12}>
                        <Row sm={12}>
                          <Col sm={2}>
                            <Form.Label>Type</Form.Label>
                            <Form.Select ref={typeForm}>
                              <option value="text">Text</option>
                              <option value="source">Source</option>
                            </Form.Select>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>K</Form.Label>
                            <Form.Control ref={kSearchForm} defaultValue={data.k} />
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Score cutoff</Form.Label>
                            <Form.Control ref={thresholdSearchForm} defaultValue={data.score} />
                          </Col>
                        </Row>
                        <Row sm={12}>
                          <Col sm={10}>
                            <Form.Control
                              ref={searchForm}
                              defaultValue={"search for something..."}
                            />
                          </Col>
                          <Col sm={1}>
                            <Button variant="success" type="submit">Search</Button>
                          </Col>
                          <Col sm={1}>
                            <Button variant="danger" onClick={() => clearButton()}>Clear</Button>
                          </Col>
                        </Row>
                      </Col>
                    </Form>
                  </Row>

                  <Row style={{ marginTop: "20px" }}>
                    <Col sm={12} style={chunks.length > 5 ? { height: "400px", overflowY: "scroll" } : {}}>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Source</th>
                            <th>Score</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            chunks.map((chunk, index) => {
                              return (
                                <tr key={index}>
                                  <td>
                                    {chunk.id}
                                  </td>
                                  <td>
                                    {chunk.source}
                                  </td>
                                  <td>
                                    {chunk.score}
                                  </td>
                                  <td>
                                    <Button onClick={() => handleChunkViewClick(chunk.id)} variant="dark">View</Button>{' '}
                                  </td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                  {
                    chunk && (
                      <Row>
                        <Col sm={12}>
                          <h2 ref={ref}>Chunk ({chunk.id}):</h2>
                          <ListGroup style={{ height: "600px", overflowY: "scroll" }}>
                            <ListGroup.Item><ReactJson src={chunk} enableClipboard={false} /></ListGroup.Item>
                          </ListGroup>
                        </Col>
                      </Row>
                    )
                  }
                </Row>
              </Tab>
            </Tabs>
          </Row>
        }
      </Container >

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title><PiFileArrowUpLight size="1.3em" /> Ingest<Link title="Ingest a file or an URL"><MdInfoOutline size="1.4em" /></Link></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={onSubmitHandler}>
            <Row>
              <Tabs
                defaultActiveKey="file"
                id="ingestTabs"
              >
                <Tab eventKey="file" title="File">
                  <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail" style={{ marginTop: "20px" }}>
                    <Col sm={12}>
                      <Form.Control ref={fileForm} onChange={handleFileChange} type="file" />
                    </Col>
                  </Form.Group>
                </Tab>
                <Tab eventKey="url" title="URL">
                  <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail" style={{ marginTop: "20px" }}>
                    <Col sm={12}>
                      <Form.Control ref={urlForm} type="url" placeholder="Enter url" />
                    </Col>
                  </Form.Group>
                </Tab>
                <Tab eventKey="text" title="Text">
                  <Form.Group as={Col} controlId="formGridSystem" style={{ marginTop: "20px" }}>
                    <Form.Label>Name</Form.Label>
                    <Form.Control ref={contentNameForm} />
                    <Form.Label>Keywords<Link title="Optional, if not provided system will automatically calculate them."><MdInfoOutline size="1.4em" /></Link></Form.Label>
                    <ReactTags
                      tags={tags}
                      suggestions={[]}
                      delimiters={[188, 13]}
                      handleDelete={handleDelete}
                      handleAddition={handleAddition}
                      handleDrag={function () { }}
                      handleTagClick={function () { }}
                      inputFieldPosition="bottom"
                      autocomplete
                    />
                    <Form.Label>Content<Link title="Instructions for the LLM know how to behave"><MdInfoOutline size="1.4em" /></Link></Form.Label>
                    <Form.Control rows="4" as="textarea" ref={contentForm} defaultValue={""} />
                  </Form.Group>
                </Tab>
              </Tabs>
            </Row>
            <Row style={{ marginTop: "20px" }}>
              <Col sm={6}>
                <Form.Label>Splitter<Link title="Sentence should work better in human readable text."><MdInfoOutline size="1.4em" /></Link></Form.Label>
              </Col>
              <Col sm={6}>
                <Form.Select ref={splitterForm}>
                  <option value="token">token</option>
                  <option value="sentence">sentence</option>
                </Form.Select>
              </Col>
            </Row>
            <Row style={{ marginTop: "20px" }}>
              <Col sm={6}>
                <Form.Label>Chunk Size</Form.Label>
              </Col>
              <Col sm={6}>
                <Form.Select ref={chunksForm} defaultValue={1024}>
                  <option value="128">128</option>
                  <option value="256">256</option>
                  <option value="512">512</option>
                  <option value="1024">1024</option>
                  <option value="2048">2048</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            {
              canSubmit ? <span>Send</span> : <Spinner animation="border" />
            }
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal show={showRoute} onHide={handleCloseRoute}>
        <Modal.Header closeButton>
          <Modal.Title><PiFileArrowUpLight size="1.3em" /> Add route</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Form.Group as={Row} className="mb-3" controlId="formGridProjectName">
              <Form.Label column sm={4}>Name</Form.Label>
              <Col sm={8}>
                <Form.Control ref={routeNameForm} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formGridProjectName">
              <Form.Label column sm={4}>Description</Form.Label>
              <Col sm={8}>
                <Form.Control rows="4" as="textarea" ref={routeDescriptionForm} />
                <Button variant="link" onClick={function () { routeDescriptionForm.current.value = "This question is about everything else not mentioned on the other choices" }}>Default Route</Button>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formGridProjectName">
              <Form.Label column sm={4}>Destination</Form.Label>
              <Col sm={8}>
                <Form.Select ref={routeProjectForm} defaultValue="">
                  <option>Choose...</option>
                  {
                    projects.map((project, index) => {
                      return (
                        <option key={index}>{project.name}</option>
                      )
                    })
                  }
                </Form.Select>
              </Col>
            </Form.Group>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRoute}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateEntrance}>
            {
              canSubmit ? <span>Create</span> : <Spinner animation="border" />
            }
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Project;