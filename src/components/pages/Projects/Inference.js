import { Container, Row, Form, InputGroup, Col, Card, Button, Spinner, Alert, Accordion, Badge } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import ReactJson from '@microlink/react-json-view';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from 'react-toastify';
import { MdInfoOutline } from "react-icons/md";
import { RiQuestionnaireLine } from "react-icons/ri";
import { FaRegPaperPlane } from "react-icons/fa";

function Inference() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  var { projectName } = useParams();
  const systemForm = useRef(null);
  const questionForm = useRef(null);
  const [answers, setAnswers] = useState([]);
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

  function resumeTemplate() {
    systemForm.current.value = "Summary the following text in 30 words or less. Do not invent anything, stick to the provided text. If there isn't enough information, answer saying that."
    questionForm.current.value = "Turmoil has engulfed the Galactic Republic. The taxation of trade routes to outlying star systems is in dispute. Hoping to resolve the matter with a blockade of deadly battleships, the greedy Trade Federation has stopped all shipping to the small planet of Naboo. While the Congress of the Republic endlessly debates this alarming chain of events, the Supreme Chancellor has secretly dispatched two Jedi Knights, the guardians of peace and justice in the galaxy, to settle the conflict."
  }

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

  const repeatClick = (answer) => {
    questionForm.current.value = answer.question;
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

    var system = systemForm.current.value;
    var question = questionForm.current.value;

    var body = {};
    var submit = false;
    if (system === "" && question !== "") {
      body = {
        "question": question
      }
      submit = true;
    } else if (system !== "" && question !== "") {
      body = {
        "question": question,
        "system": system
      }
      submit = true;
    }
    body.stream = true;

    setAnswert([]);

    if (submit && canSubmit) {
      setCanSubmit(false);
      fetchEventSource(url + "/projects/" + projectName + "/question", {
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
              setAnswers([...answers, { question: question, answer: "Error, something went wrong with my transistors.", sources: [] }]);
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

    var system = systemForm.current.value;
    var question = questionForm.current.value;

    var body = {};
    var submit = false;
    if (system === "" && question !== "") {
      body = {
        "question": question
      }
      submit = true;
    } else if (system !== "" && question !== "") {
      body = {
        "question": question,
        "system": system
      }
      submit = true;
    }

    if (submit && canSubmit) {
      setCanSubmit(false);
      setAnswers([...answers, { question: question, answer: null }]);
      fetch(url + "/projects/" + projectName + "/question", {
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
          setAnswers([...answers, { question: question, answer: response.answer }]);
          questionForm.current.value = "";
          setCanSubmit(true);
        }).catch(err => {
          toast.error(err.toString());
          setAnswers([...answers, { question: question, answer: "Error, something went wrong with my transistors." }]);
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

  const checkPrivacy = () => {
    if (data.llm_privacy === "private") {
      return true;
    } else {
      return false;
    }
  }

  useEffect(() => {
    document.title = 'RESTAI - Inference - ' + projectName;
    fetchProject(projectName);
  }, [projectName]);

  useEffect(() => {
    if (answert[answert.length - 1] && JSON.parse(answert[answert.length - 1]).answer !== undefined) {
      var info = JSON.parse(answert.pop());
      setAnswers([...answers, { question: questionForm.current.value, answer: info.answer }]);
      setAnswert([]);
      questionForm.current.value = "";
      setCanSubmit(true);
    }
  }, [answert]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1><RiQuestionnaireLine size="1.3em" /> Inference - {projectName}</h1>
        <h5>
          {checkPrivacy() ?
            <Badge bg="success">Local AI <Link title="You are NOT SHARING any data with external entities."><MdInfoOutline size="1.4em" /></Link></Badge>
            :
            <Badge bg="danger">Public AI <Link title="You ARE SHARING data with external entities."><MdInfoOutline size="1.4em" /></Link></Badge>
          }
        </h5>
        <Row style={{ marginBottom: "15px" }}>
          <Col sm={12}>
            (Remember that every question is stateless there is no memory of previous questions)
          </Col>
        </Row>
        <Form onSubmit={onSubmitHandler}>
          <Row>
            <Col sm={10}>
              <InputGroup>
                <InputGroup.Text>System</InputGroup.Text>
                <Form.Control ref={systemForm} rows="5" as="textarea" aria-label="With textarea" defaultValue={data.system ? data.system : ""} />
              </InputGroup>
            </Col>
            <Col sm={2}>
              <h5>System Templates:</h5>
              <InputGroup>
                <Button variant="dark" onClick={resumeTemplate} size="sm">Resume Text</Button>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            {(answers.length > 0 || answert.length > 0) &&
              <Col sm={12} style={{ marginTop: "20px" }}>
                <Card>
                  <Card.Header>Results</Card.Header>
                  <Card.Body>
                    {
                      answers.map((answer, index) => {
                        return (
                          <div>
                            <div className='lineBreaks' key={index} style={index === 0 ? { marginTop: "0px" } : { marginTop: "10px" }}>
                              🧑<span className='highlight'>QUESTION:</span> {answer.question} <br />
                              🤖<span className='highlight'>ANSWER:</span> {(answer.answer == null ? <Spinner animation="grow" size="sm" /> : answer.answer)}
                            </div>
                            <div style={{ marginBottom: "0px" }}>
                              <Accordion>
                                <div style={{ textAlign: "right", marginBottom: "0px" }}>
                                  <CustomToggle title="Details" eventKey="0" >🔎</CustomToggle>
                                  <span title="Repeat" style={{ marginLeft: "10px", cursor: "pointer" }} onClick={() => repeatClick(answer)}>🔁</span>
                                </div>
                                <Accordion.Collapse eventKey="0">
                                  <Card.Body><ReactJson src={answer} enableClipboard={false} /></Card.Body>
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
                        🧑<span className='highlight'>QUESTION:</span> {questionForm.current.value} <br />
                        🤖<span className='highlight'>ANSWER:</span> {answert.map(answer => {
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
                <InputGroup.Text>Question</InputGroup.Text>
                <Form.Control ref={questionForm} rows="5" as="textarea" aria-label="With textarea" />
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
                    canSubmit ? <span><FaRegPaperPlane size="0.9em" /> Ask</span> : <Spinner animation="border" />
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

export default Inference;