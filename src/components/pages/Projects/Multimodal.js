import { Container, Row, Form, InputGroup, Col, Card, Button, Spinner, Accordion, Badge } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import ReactJson from '@microlink/react-json-view';
import ModalImage from "react-modal-image";
import { FileUploader } from "react-drag-drop-files";
import { toast } from 'react-toastify';
import { FaRegPaperPlane } from "react-icons/fa";
import { RiQuestionnaireLine } from "react-icons/ri";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const fileTypes = ["JPG", "JPEG", "PNG", "GIF", "JPEGZ"];

function Multimodal() {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  var { projectName } = useParams();
  const questionForm = useRef(null);
  const systemForm = useRef(null);
  const [data, setData] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [uploadForm, setUploadForm] = useState(null);
  const [info, setInfo] = useState({ "version": "", "embeddings": [], "llms": [], "loaders": [] });
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [canSubmit, setCanSubmit] = useState(true);
  const { getBasicAuth } = useContext(AuthContext);
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

  const repeatClick = (answer) => {
    questionForm.current.value = answer.question;
    onSubmitHandler();
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

  const onSubmitHandler = (event) => {
    if (event)
      event.preventDefault();

    var question = questionForm.current.value;

    var body = {};
    var submit = false;
    if (question !== "") {
      body = {
        "question": question,
      }
      if (file && file.includes("base64,")) {
        body.image = file.split(",")[1];
      } else {
        body.image = file;
      }
      submit = true;
    }

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
          setAnswers([...answers, { question: question, answer: response.answer, sources: response.sources, image: response.image }]);
          questionForm.current.value = "";
          setCanSubmit(true);
        }).catch(err => {
          console.log(err.toString());
          setAnswers([...answers, { question: question, answer: "Error, something went wrong with my transistors.", sources: [], image: null }]);
          setCanSubmit(true);
        });
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

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };
  const handleFileUpload = async (file) => {
    //const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setFile(base64);
  };

  useEffect(() => {
    document.title = 'RESTAI - Multimodal - ' + projectName;
    fetchProject(projectName);
    fetchInfo();
  }, [projectName]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1><RiQuestionnaireLine size="1.3em" /> Multimodal - {projectName}</h1>
        <h5>
          {checkPrivacy() ?
            <Badge bg="success">Local AI <Link title="You are NOT SHARING any data with external entities.">ℹ️</Link></Badge>
            :
            <Badge bg="danger">Public AI <Link title="You ARE SHARING data with external entities.">ℹ️</Link></Badge>
          }
        </h5>
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
            {answers.length > 0 &&
              <Col sm={12} style={{ marginTop: "20px" }}>
                <Card>
                  <Card.Header>Results</Card.Header>
                  <Card.Body>
                    {
                      answers.map((answer, index) => {
                        let answerCopy = Object.assign({}, answer);
                        if (answerCopy.image !== null)
                          answerCopy.image = "...";
                        return (answer.answer != null ?
                          <div>
                            <div className='lineBreaks' key={index} style={index === 0 ? { marginTop: "0px" } : { marginTop: "10px" }}>
                              🧑<span className='highlight'>QUESTION:</span> {answer.question} <br />
                              🤖<span className='highlight'>ANSWER:</span> {answer.answer}
                              {answer.image &&
                                <Col sm={4}>
                                  <ModalImage
                                    small={`data:image/jpg;base64,${answer.image}`}
                                    large={`data:image/jpg;base64,${answer.image}`}
                                    alt="Image preview"
                                  />
                                </Col>
                              }
                            </div>
                            <div style={{ marginBottom: "0px" }}>
                              <Accordion>
                                <div style={{ textAlign: "right", marginBottom: "0px" }}>
                                  <CustomToggle title="Details" eventKey="0" >🔎</CustomToggle>
                                  <span title="Repeat" style={{ marginLeft: "10px", cursor: "pointer" }} onClick={() => repeatClick(answer)}>🔁</span>
                                </div>
                                <Accordion.Collapse eventKey="0">
                                  <Card.Body><ReactJson src={answerCopy} enableClipboard={false} /></Card.Body>
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
                <InputGroup.Text>{"🧑 Message"}</InputGroup.Text>
                <Form.Control ref={questionForm} rows="2" as="textarea" aria-label="Question textarea" defaultValue={data.default_prompt ? data.default_prompt : ""}/>
              </InputGroup>
            </Col>
          </Row>
          {(data.type === "vision") &&
            <Row>
              <Col sm={12}>
                <FileUploader fileOrFiles={uploadForm} classes="dragging" handleChange={handleFileUpload} name="file" types={fileTypes} />
              </Col>
            </Row>
          }
          <hr />
          <Row style={{ marginTop: "20px" }}>
            <Col sm={10}>
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

export default Multimodal;