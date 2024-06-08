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
import { MdInfoOutline } from "react-icons/md";
import { Rating } from '@smastrom/react-rating'
import '@smastrom/react-rating/style.css'
import { FaRegPaperPlane } from "react-icons/fa";
import { RiQuestionnaireLine } from "react-icons/ri";

function Question() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  var { projectName } = useParams();
  const systemForm = useRef(null);
  const questionForm = useRef(null);
  const scoreForm = useRef(null);
  const kForm = useRef(null);
  const [info, setInfo] = useState({ "version": "", "embeddings": [], "llms": [], "loaders": [] });
  const [answers, setAnswers] = useState([]);
  const [canSubmit, setCanSubmit] = useState(true);
  const [data, setData] = useState({ projects: [] });
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();
  const isStream = useRef(null)
  const isEval = useRef(null)
  const isColbertRerank = useRef(null)
  const isLLMRerank = useRef(null)
  const [answert, setAnswert] = useState([]);

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  function ragTemplate() {
    systemForm.current.value = "You are a digital assistant, answer the question about the following context. NEVER invent an answer, if you don't know the answer, just say you don't know. If you don't understand the question, just say you don't understand."
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
    if (event)
      event.preventDefault();

    if (data.chunks === 0) {
      toast.error('No data. Ingest some data first.');
      return;
    }

    if (isEval.current.checked && isStream.current.checked) {
      toast.error('Evaluate and Stream cannot be used together for now.');
      return;
    }

    if (isColbertRerank.current.checked && isLLMRerank.current.checked) {
      toast.error('Colbert Rerank and LLM Rerank cannot be used together for now.');
      return;
    }

    if (isStream.current.checked) {
      handlerStream(event);
    } else {
      handler(event);
    }
  }

  const buildBody = () => {
    var system = systemForm.current.value;
    var question = questionForm.current.value;
    var k = parseInt(kForm.current.value);
    var score = parseFloat(scoreForm.current.value);
    var colbert_rerank = isColbertRerank.current.checked;
    var llm_rerank = isLLMRerank.current.checked;
    var llm_eval = isEval.current.checked;

    var body = {
      "question": question,
      "k": k,
      "score": score,
      "colbert_rerank": colbert_rerank,
      "llm_rerank": llm_rerank,
      "eval": llm_eval,
    }

    if (system !== "" && question !== "") {
      body.system = system;
    }

    return body;
  }

  const handlerStream = (event) => {
    if (event)
      event.preventDefault();

    var question = questionForm.current.value;
    var submit = true;
    var body = buildBody();

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

    var question = questionForm.current.value;
    var submit = true;
    var body = buildBody();

    if (submit && canSubmit) {
      setCanSubmit(false);
      setAnswers([...answers, { question: question, answer: null, sources: [] }]);
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
          var aux = { question: question, answer: response.answer, sources: response.sources, cached: response.cached, guard: response.guard }
          if (response.evaluation != null && response.evaluation !== undefined) {
            aux.evaluation = response.evaluation;
          }
          setAnswers([...answers, aux]);
          questionForm.current.value = "";
          setCanSubmit(true);
          if (response.guard === true) {
            toast.warning('This question hit the prompt guard. Sandbox message sent.', { duration: 6000, position: 'top-right' });
          } else if (data.type === "rag" && response.sources.length === 0) {
            toast.warning('No sources found for this question. Decrease the score cutoff parameter.', { duration: 6000, position: 'top-right' });
          }
        }).catch(err => {
          toast.error(err.toString());
          setAnswers([...answers, { question: question, answer: "Error, something went wrong with my transistors.", sources: [] }]);
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
    document.title = 'RESTAI - Question - ' + projectName;
    fetchProject(projectName);
    fetchInfo();
  }, [projectName]);

  useEffect(() => {
    if (answert[answert.length - 1] && JSON.parse(answert[answert.length - 1]).answer !== undefined) {
      var info = JSON.parse(answert.pop());
      var aux = { question: questionForm.current.value, answer: info.answer, sources: info.sources, cached: info.cached }
      if (info.evaluation != null && info.evaluation !== undefined) {
        aux.evaluation = info.evaluation;
      }
      setAnswers([...answers, aux]);
      setAnswert([]);
      questionForm.current.value = "";
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
        <h1><RiQuestionnaireLine size="1.3em" /> Question - {projectName}</h1>
        <h5>
          {checkPrivacy() ?
            <Badge bg="success">Local AI <Link title="You are NOT SHARING any data with external entities."><MdInfoOutline size="1.4em" /></Link></Badge>
            :
            <Badge bg="danger">Public AI <Link title="You ARE SHARING data with external entities."><MdInfoOutline size="1.4em" /></Link></Badge>
          }
        </h5>
        <Row style={{ marginBottom: "15px" }}>
          <Col sm={12}>
            (Remember that in Question mode, every question is stateless there is no memory of previous questions. If there are no embeddings expect "Empty Response" in the output.)
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
                <Button variant="dark" onClick={ragTemplate} size="sm">Classic RAG</Button>
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

                            {answer.evaluation != null && answer.evaluation !== undefined &&
                              <div>
                                <hr style={{ borderStyle: "dashed" }} />
                                <div style={{ textAlign: "right", marginBottom: "0px" }}>
                                  <Rating value={(answer.evaluation.score * 5) / 1} style={{ maxWidth: 100 }} readOnly />
                                </div>
                                <div>
                                  👮<span className='highlight'>EVALUATOR:</span> {answer.evaluation.reason}
                                </div>
                              </div>
                            }
                            {answer.answer != null &&
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
                            }
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
          {(data.type === "rag") &&
            <Row style={{ marginTop: "20px" }}>
              <Col sm={6}>
                <InputGroup>
                  <InputGroup.Text>Score Cutoff<Link title="Value between 0 and 1. Larger equals more similarity required from embeddings during retrieval process. Smaller less similarity required."><MdInfoOutline size="1.4em" /></Link></InputGroup.Text>
                  <Form.Control ref={scoreForm} defaultValue={data.score} />
                </InputGroup>
              </Col>
              <Col sm={6}>
                <InputGroup>
                  <InputGroup.Text>k<Link title="Bigger value slower results but more data from embeddings will be used."><MdInfoOutline size="1.4em" /></Link></InputGroup.Text>
                  <Form.Control ref={kForm} defaultValue={data.k} />
                </InputGroup>
              </Col>
            </Row>
          }
          <Row style={{ marginTop: "20px" }}>
            <Col sm={6}>
            </Col>
            <Col sm={1}>
              <Form.Group as={Col} controlId="formGridAdmin1">
                <Form.Check ref={isLLMRerank} type="checkbox" label="LLM Rerank" />
              </Form.Group>
            </Col>
            <Col sm={1}>
              <Form.Group as={Col} controlId="formGridAdmin2">
                <Form.Check ref={isColbertRerank} type="checkbox" label="Colbert Rerank" />
              </Form.Group>
            </Col>
            <Col sm={1}>
              <Form.Group as={Col} controlId="formGridAdmin3">
                <Form.Check ref={isStream} type="checkbox" label="Stream" />
              </Form.Group>
            </Col>
            <Col sm={1}>
              <Form.Group as={Col} controlId="formGridAdmin4">
                <Form.Check ref={isEval} type="checkbox" label="Evaluate" />
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
      </Container >
    </>
  );
}

export default Question;