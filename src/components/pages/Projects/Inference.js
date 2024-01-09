import { Container, Row, Form, InputGroup, Col, Card, Button, Spinner, Alert, Accordion, Badge } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import ReactJson from '@microlink/react-json-view';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function Inference() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  var { projectName } = useParams();
  const systemForm = useRef(null);
  const questionForm = useRef(null);
  const [answers, setAnswers] = useState([]);
  const [canSubmit, setCanSubmit] = useState(true);
  const [data, setData] = useState({ projects: [] });
  const [error, setError] = useState([]);
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <a href="#" style={{ fontSize: "small", margin: "3px" }}>{children}</a>
    </OverlayTrigger>
  );

  function resumeTemplate() {
    systemForm.current.value = "Resume the following text in 30 words or less."
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

  const onSubmitHandler = (event) => {
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
      setAnswers([...answers, { question: question, answer: null}]);
      fetch(url + "/projects/" + projectName + "/inference", {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
        body: JSON.stringify(body),
      })
        .then(function (response) {
          if (!response.ok) {
            response.json().then(function (data) {
              setError(data.detail);
            });
            throw Error(response.statusText);
          } else {
            return response.json();
          }
        })
        .then((response) => {
          setAnswers([...answers, { question: question, answer: response.answer}]);
          questionForm.current.value = "";
          setCanSubmit(true);
        }).catch(err => {
          setError(err.toString());
          setAnswers([...answers, { question: question, answer: "Error, something went wrong with my transistors."}]);
          setCanSubmit(true);
        });
    }
  }

  const fetchProject = (projectName) => {
    return fetch(url + "/projects/" + projectName, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then(function (response) {
        if (!response.ok) {
          response.json().then(function (data) {
            setError(data.detail);
          });
          throw Error(response.statusText);
        } else {
          return response.json();
        }
      })
      .then((d) => setData(d)
      ).catch(err => {
        setError(err.toString());
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
    document.title = 'RestAI  Inference ' + projectName;
    fetchProject(projectName);
  }, [projectName]);

  return (
    <>
      {error.length > 0 &&
        <Alert variant="danger">
          {JSON.stringify(error)}
        </Alert>
      }
      <Container style={{ marginTop: "20px" }}>
        <h1>Inference {projectName}</h1>
        <h5>
          {checkPrivacy() ?
            <Badge bg="success">Local AI <Link title="You are NOT SHARING any data with external entities.">ℹ️</Link></Badge>
            :
            <Badge bg="danger">Public AI <Link title="You ARE SHARING data with external entities.">ℹ️</Link></Badge>
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
            {answers.length > 0 &&
              <Col sm={12} style={{ marginTop: "20px" }}>
                <Card>
                  <Card.Header>Results</Card.Header>
                  <Card.Body>
                    {
                      answers.map((answer, index) => {
                        return (answer.answer != null ?
                          <div className='lineBreaks' key={index} style={index === 0 ? { marginTop: "0px" } : { marginTop: "10px" }}>
                            🧑<span className='highlight'>QUESTION:</span> {answer.question} <br />
                            🤖<span className='highlight'>ANSWER:</span> {answer.answer}
                            <Accordion>
                              <Row style={{ textAlign: "right", marginBottom: "0px" }}>
                                <CustomToggle eventKey="0">Details</CustomToggle>
                              </Row>
                              <Accordion.Collapse eventKey="0">
                                <Card.Body><ReactJson src={answer} enableClipboard={false} /></Card.Body>
                              </Accordion.Collapse>
                            </Accordion>
                            <hr />
                          </div>
                          :
                          <div className='lineBreaks' key={index} style={index === 0 ? { marginTop: "0px" } : { marginTop: "10px" }}>
                            🧑<span className='highlight'>QUESTION:</span> {answer.question} <br />
                            🤖<span className='highlight'>ANSWER:</span> <Spinner animation="grow" size="sm" />
                            <hr />
                          </div>
                        )
                      })
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
            <Col sm={10}>
            </Col>
            <Col sm={2}>
              <div className="d-grid gap-2">
                <Button variant="dark" type="submit" size="lg">
                  {
                    canSubmit ? <span>Ask</span> : <Spinner animation="border" />
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