import { Container, Row, Form, InputGroup, Col, Card, Button, Spinner, Accordion, Badge } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import ReactJson from '@microlink/react-json-view';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { WithContext as ReactTags } from 'react-tag-input';
import { toast } from 'react-toastify';
import { MdInfoOutline } from "react-icons/md";

function Inference() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  var { projectName } = useParams();
  const questionForm = useRef(null);
  const [answers, setAnswers] = useState([]);
  const [canSubmit, setCanSubmit] = useState(true);
  const [data, setData] = useState({ projects: [] });
  const { getBasicAuth } = useContext(AuthContext);
  const [tags, setTags] = React.useState([]);
  const user = getBasicAuth();

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

  const handleDelete = i => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = tag => {
    setTags([...tags, tag]);
  };

  const repeatClick = (answer) => {
    questionForm.current.value = answer.question;;
    onSubmitHandler();
  }

  const onSubmitHandler = (event) => {
    if (event)
      event.preventDefault();

    var question = questionForm.current.value;

    var body = {};
    var submit = false;
    if (question !== "") {
      body = {
        "question": question
      }

      if (tags.length > 0) {
        body.tables = tags.map((tag) => tag.text);
      }

      submit = true;
    }

    if (submit && canSubmit) {
      setCanSubmit(false);
      setAnswers([...answers, { question: question, answer: null, sources: [] }]);
      fetch(url + "/projects/" + projectName + "/questionsql", {
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
          setAnswers([...answers, { question: question, answer: response.answer, sources: response.sources }]);
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
    document.title = 'QuestionSQL - ' + projectName;
    fetchProject(projectName);
  }, [projectName]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1>Question (SQL) - {projectName}</h1>
        <h5>
          {checkPrivacy() ?
            <Badge bg="success">Local AI <Link title="You are NOT SHARING any data with external entities."><MdInfoOutline size="1.4em"/></Link></Badge>
            :
            <Badge bg="danger">Public AI <Link title="You ARE SHARING data with external entities."><MdInfoOutline size="1.4em"/></Link></Badge>
          }
        </h5>
        <Row style={{ marginBottom: "15px" }}>
          <Col sm={12}>
            (Remember that every question is stateless there is no memory of previous questions)
          </Col>
        </Row>
        <Form onSubmit={onSubmitHandler}>
          <Row>
            {answers.length > 0 &&
              <Col sm={12} style={{ marginTop: "20px" }}>
                <Card>
                  <Card.Header>Results</Card.Header>
                  <Card.Body>
                    {
                      answers.map((answer, index) => {
                        return (answer.answer != null ?
                          <div>
                            <div className='lineBreaks' key={index} style={index === 0 ? { marginTop: "0px" } : { marginTop: "10px" }}>
                              🧑<span className='highlight'>QUESTION:</span> {answer.question} <br />
                              🤖<span className='highlight'>ANSWER:</span> {answer.answer}
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
            <Col sm={1}>
              <Form.Label>Tables:<Link title="Leave empty to use all tables in context, may not fit in model's context windows. Specify tables if you want to reduce the scope."><MdInfoOutline size="1.4em"/></Link></Form.Label>
            </Col>
            <Col sm={9}>
              <ReactTags
                tags={tags}
                suggestions={[]}
                delimiters={[188, 13]}
                handleDelete={handleDelete}
                handleAddition={handleAddition}
                handleDrag={function () { }}
                handleTagClick={function () { }}
                inputFieldPosition="top"
                autocomplete
              />
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