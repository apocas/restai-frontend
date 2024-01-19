import { Container, Row, Form, InputGroup, Col, Card, Button, Spinner, Alert, Accordion, NavLink } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import ReactJson from '@microlink/react-json-view';
import ModalImage from "react-modal-image";
import NoImage from '../../../assets/img/no-image.jpg'
import { FileUploader } from "react-drag-drop-files";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const fileTypes = ["JPG", "PNG", "GIF", "JPEGZ"];

function Vision() {
  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <a href="#" style={{ fontSize: "small", margin: "3px" }}>{children}</a>
    </OverlayTrigger>
  );

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  var { projectName } = useParams();
  const questionForm = useRef(null);
  const [uploadForm, setUploadForm] = useState(null);
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [canSubmit, setCanSubmit] = useState(true);
  const [error, setError] = useState([]);
  const { getBasicAuth } = useContext(AuthContext);
  const isDisableBoostForm = useRef(null)
  const user = getBasicAuth();

  function sdTemplate() {
    questionForm.current.value = "Using stable diffusion generate a picture of a happy cat."
  }

  function dalleTemplate() {
    questionForm.current.value = "Using dall-e generate a picture of a happy cat."
  }

  function describeTemplate() {
    questionForm.current.value = "Describe this image, be detailed."
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

  const descriptionClick = (answer) => {
    var lastQuestion = "";
    if (answer.image === null) {
      lastQuestion = answer.answer;
    } else {
      return repeatClick();
    }

    var question = lastQuestion
    if (lastQuestion.indexOf("Generate an image from the following description: ") !== 0) {
      question = "Generate an image from the following description: " + lastQuestion;
    }

    questionForm.current.value = question;

    if (window.confirm("Do you want to boost this prompt using AI? (Cancel for no)")) {
      isDisableBoostForm.current.checked = false;
    } else {
      isDisableBoostForm.current.checked = true;
    }

    onSubmitHandler();
  }

  const onSubmitHandler = (event) => {
    if (event)
      event.preventDefault();

    var question = questionForm.current.value;

    var body = {};
    var submit = false;
    if (question !== "") {
      if (file && file.includes("base64,")) {
        body = {
          "question": question,
          "image": file.split(",")[1],
          "disableboost": isDisableBoostForm.current.checked
        }
      } else {
        body = {
          "question": question,
          "image": file,
          "disableboost": isDisableBoostForm.current.checked
        }
      }
      submit = true;
    }

    if (submit && canSubmit) {
      setCanSubmit(false);
      setAnswers([...answers, { question: question, answer: null, sources: [] }]);
      fetch(url + "/projects/" + projectName + "/vision", {
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
          setAnswers([...answers, { question: question, answer: response.answer, sources: response.sources, image: response.image }]);
          questionForm.current.value = "";
          setCanSubmit(true);
        }).catch(err => {
          setError(err.toString());
          setAnswers([...answers, { question: question, answer: "Error, something went wrong with my transistors.", sources: [], image: null }]);
          setCanSubmit(true);
        });
    }
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
    document.title = 'Vision - ' + projectName;
  }, [projectName]);

  return (
    <>
      {error.length > 0 &&
        <Alert variant="danger" style={{ textAlign: "center" }}>
          {JSON.stringify(error)}
        </Alert>
      }
      <Container style={{ marginTop: "20px" }}>
        <h1>Vision - {projectName}</h1>
        <Row style={{ textAlign: "right", marginLeft: "4px", marginBottom: "15px", marginTop: "-9px" }}>
          (For generation remember to specify if you want to use Dall-e or Stable Diffusion in plain english)
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
                                  {answer.image == null && <span title="Generate image from description" style={{ marginLeft: "10px", cursor: "pointer" }} onClick={() => descriptionClick(answer)}>🖼️</span>}
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
            <Col sm={8}>
              <InputGroup style={{ height: "100%" }}>
                <InputGroup.Text>{file ? "Question" : "Prompt"}</InputGroup.Text>
                <Form.Control ref={questionForm} rows="5" as="textarea" aria-label="Question textarea" />
              </InputGroup>
            </Col>
            <Col sm={4}>
              <center>
                <ModalImage
                  width="50%"
                  small={file ? file : NoImage}
                  large={file ? file : NoImage}
                  alt="Image preview"
                />
              </center>
              <FileUploader fileOrFiles={uploadForm} classes="dragging" handleChange={handleFileUpload} name="file" types={fileTypes} />
            </Col>
          </Row>
          <Row>
            <Col sm={1}>
              Templates:
            </Col>
            <Col sm={11}>

              <Button variant="dark" onClick={sdTemplate} size="sm">Generate Stable Diffusion (local)</Button>
              <Button variant="dark" onClick={dalleTemplate} size="sm">Generate Dall-e (openai)</Button>
              <Button variant="dark" onClick={describeTemplate} size="sm">Describe image (local)</Button>

            </Col>
          </Row>
          <hr />
          <Row style={{ marginTop: "20px" }}>
            <Col sm={10} style={{display: "inline-flex"}}>
              <Form.Group as={Col} controlId="formGridAdmin">
                <Form.Check ref={isDisableBoostForm} type="checkbox" label="Disable Prompt Booster" />
                <Link title="Disable prompt booster. Uses AI to boost user's prompt with more details and content.">ℹ️</Link>
              </Form.Group>
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

export default Vision;