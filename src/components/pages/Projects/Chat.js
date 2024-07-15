import { Container, Row, Form, InputGroup, Col, Card, Button, Spinner, Accordion, Badge } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import ReactJson from '@microlink/react-json-view';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from 'react-toastify';
import { FaRegPaperPlane } from "react-icons/fa";
import { MdOutlineChat } from "react-icons/md";

function Chat() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  var { projectName } = useParams();
  const messageForm = useRef(null);
  const systemForm = useRef(null);
  const [info, setInfo] = useState({ "version": "", "embeddings": [], "llms": [], "loaders": [] });
  const [messages, setMessages] = useState([]);
  const [canSubmit, setCanSubmit] = useState(true);
  const [data, setData] = useState({ projects: [] });
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();
  const isStream = useRef(null)
  const [answert, setAnswert] = useState([]);

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  function CustomToggle({ children, eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey);

    return (
      <span
        onClick={decoratedOnClick} style={{ cursor: 'pointer' }}
      >
        {children}
      </span>
    );
  }

  const repeatClick = (message) => {
    messageForm.current.value = message.question;
    onSubmitHandler();
  }

  const onSubmitHandler = (event) => {
    if (isStream.current.checked) {
      handlerStream(event);
    } else {
      handler(event);
    }
  }

  const handlerStream = (event) => {
    if (event)
      event.preventDefault();

    var question = messageForm.current.value;
    var id = "";

    if (messages.length === 0) {
      id = "";
    } else {
      id = messages[messages.length - 1].id
    }

    var body = { "question": question };
    var submit = false;

    if (question !== "" && id === "") {
      submit = true;
    } else if (question !== "" && id !== "") {
      body.id = id;
      submit = true;
    }

    body.stream = true;
    setAnswert([]);

    if (submit && canSubmit) {
      setCanSubmit(false);
      fetchEventSource(url + "/projects/" + projectName + "/chat", {
        method: "POST",
        headers: { 'Accept': 'text/event-stream', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth },
        body: JSON.stringify(body),
        onopen(res) {
          if (res.ok && res.status === 200) {
            console.log("Connection made ", res);
          } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            console.log("Client-side error ", res);
          }
        },
        onmessage(event) {
          if (event.event === "close" || event.event === "error") {
            if (event.event === "error") {
              toast.error(event.data);
              setMessages([...messages, { id: id, question: question, answer: "Error, something went wrong with my transistors.", sources: [] }]);
              setCanSubmit(true);
            } else {
              setAnswert((answert) => [...answert, event.data]);
            }
          } else {
            setAnswert((answert) => [...answert, event.data]);
          }

        },
        onclose() {
          console.log("Connection closed by the server");
        },
        onerror(err) {
          console.log("There was an error from server", err);
        },
      });
    }
  }

  const handler = (event) => {
    if (event)
      event.preventDefault();

    var question = messageForm.current.value;
    var id = "";

    if (messages.length === 0) {
      id = "";
    } else {
      id = messages[messages.length - 1].id
    }

    var body = {};
    var submit = false;
    if (question !== "" && id === "") {
      body = {
        "question": question
      }
      submit = true;
    } else if (question !== "" && id !== "") {
      body = {
        "question": question,
        "id": id
      }
      submit = true;
    }

    if (submit && canSubmit) {
      setCanSubmit(false);
      setMessages([...messages, { id: id, question: question, answer: null, sources: [] }]);
      fetch(url + "/projects/" + projectName + "/chat", {
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
          setMessages([...messages, { id: response.id, question: response.question, answer: response.answer, sources: response.sources, cached: response.cached, guard: response.guard }]);
          messageForm.current.value = "";
          setCanSubmit(true);
          if (response.guard === true) {
            toast.warning('This question hit the prompt guard. Sandbox message sent.', { duration: 6000, position: 'top-right' });
          } else if (data.type === "rag" && response.sources.length === 0) {
            toast.warning('No sources found for this question. Decrease the score cutoff parameter.', { duration: 6000, position: 'top-right' });
          }
        }).catch(err => {
          toast.error(err.toString());
          setMessages([...messages, { id: id, question: question, answer: "Error, something went wrong with my transistors.", sources: [] }]);
          setCanSubmit(true);
        });
    }
  }

  const fetchProject = (projectName) => {
    return fetch(url + "/projects/" + projectName, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
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
      .then((d) => setData(d)
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
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RestAI")  + ' - Chat - ' + projectName;
    fetchProject(projectName);
    fetchInfo();
  }, [projectName]);

  useEffect(() => {
    if (answert[answert.length - 1] && JSON.parse(answert[answert.length - 1]).answer !== undefined) {
      var info = JSON.parse(answert.pop());
      setMessages([...messages, { id: info.id, question: messageForm.current.value, answer: info.answer, sources: info.sources }]);
      setAnswert([]);
      messageForm.current.value = "";
      setCanSubmit(true);
      if (info.guard === true) {
        toast.warning('This question hit the prompt guard. Sandbox message sent.', { duration: 6000, position: 'top-right' });
      } else if (data.type === "rag" && info.sources.length === 0) {
        toast.warning('No sources found for this question. Decrease the score cutoff parameter.', { duration: 6000, position: 'top-right' });
      }
    }
  }, [answert]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1><MdOutlineChat size="1.3em" /> Chat - {projectName}</h1>
        <h5>
          {checkPrivacy() ?
            <Badge bg="success">Local AI <Link title="You are NOT SHARING any data with external entities.">ℹ️</Link></Badge>
            :
            <Badge bg="danger">Public AI <Link title="You ARE SHARING data with external entities.">ℹ️</Link></Badge>
          }
        </h5>
        <Row style={{ marginBottom: "15px" }}>
          <Col sm={12}>
            {'Check how to consume this project via API '}<b><a href={"/admin/projects/" + projectName + "/api"}>here</a></b>.
          </Col>
        </Row>
        <Row>
          {data.human_description &&
            <Col sm={12}>
              <b>Project description:</b><br />
              <span style={{ whiteSpace: "pre-line" }}>{data.human_description}</span>
            </Col>
          }
        </Row>
        <Form onSubmit={onSubmitHandler}>
          <Row>
            {(data.system !== "") &&
              <Col sm={12}>
                <InputGroup>
                  <InputGroup.Text>System</InputGroup.Text>
                  <Form.Control disabled ref={systemForm} rows="5" as="textarea" aria-label="With textarea" defaultValue={data.system ? data.system : ""} />
                </InputGroup>
              </Col>
            }
            {(messages.length > 0 || answert.length > 0) &&
              <Col sm={12}>
                <Card>
                  <Card.Header>Results</Card.Header>
                  <Card.Body>
                    {
                      messages.map((message, index) => {
                        return (
                          <div>
                            <div className='lineBreaks' key={index} style={index === 0 ? { marginTop: "0px" } : { marginTop: "10px" }}>
                              🧑<span className='highlight'>MESSAGE:</span> {message.question} <br />
                              🤖<span className='highlight'>RESPONSE:</span> {(message.answer == null ? <Spinner animation="grow" size="sm" /> : message.answer)}
                            </div>
                            <div style={{ marginBottom: "0px" }}>
                              <Accordion>
                                <div style={{ textAlign: "right", marginBottom: "0px" }}>
                                  <CustomToggle title="Details" eventKey="0" >🔎</CustomToggle>
                                  <span title="Repeat" style={{ marginLeft: "10px", cursor: "pointer" }} onClick={() => repeatClick(message)}>🔁</span>
                                </div>
                                <Accordion.Collapse eventKey="0">
                                  <Card.Body><ReactJson src={message} enableClipboard={false} /></Card.Body>
                                </Accordion.Collapse>
                              </Accordion>
                            </div>
                            <hr />
                          </div>
                        )
                      })
                    }
                    {answert.length > 0 &&
                      <div className='lineBreaks' style={{ marginTop: "10px" }}>
                        🧑<span className='highlight'>MESSAGE:</span> {messageForm.current.value} <br />
                        🤖<span className='highlight'>RESPONSE:</span> {answert.map(answer => {
                          const parsedAnswer = JSON.parse(answer);
                          return parsedAnswer.text !== undefined ? parsedAnswer.text : '';
                        }).join('')}
                        <hr />
                      </div>
                    }
                  </Card.Body>
                </Card>
              </Col>
            }
          </Row>
          <Row style={{ marginTop: "20px" }}>
            <Col sm={12}>
              <InputGroup>
                <InputGroup.Text>🧑 Message</InputGroup.Text>
                <Form.Control ref={messageForm} rows="2" as="textarea" aria-label="With textarea" defaultValue={data.default_prompt ? data.default_prompt : ""}/>
              </InputGroup>
            </Col>
          </Row>
          <Row style={{ marginTop: "20px" }}>
            <Col sm={9}>
            </Col>
            <Col sm={1}>
              <Form.Group as={Col} controlId="formGridAdmin">
                <Form.Check ref={isStream} type="checkbox" label="Stream" />
              </Form.Group>
            </Col>
            <Col sm={2}>
              <div className="d-grid gap-2">
                <Button variant="dark" type="submit" size="lg">
                  {
                    canSubmit ? <span><FaRegPaperPlane size="0.9em" /> Send</span> : <Spinner animation="border" />
                  }
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
}

export default Chat;