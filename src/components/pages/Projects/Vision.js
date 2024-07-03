import { Container, Row, Form, InputGroup, Col, Card, Button, Spinner, Accordion } from 'react-bootstrap';
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
import { toast } from 'react-toastify';
import { MdInfoOutline, MdOutlineImage } from "react-icons/md";
import { FaRegPaperPlane } from "react-icons/fa";

const fileTypes = ["JPG", "JPEG", "PNG", "GIF", "JPEGZ"];

function Vision() {
  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  var { projectName } = useParams();
  const questionForm = useRef(null);
  const negativePromptForm = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [uploadForm, setUploadForm] = useState(null);
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [canSubmit, setCanSubmit] = useState(true);
  const { getBasicAuth } = useContext(AuthContext);
  const isEnableBoostForm = useRef(null)
  const user = getBasicAuth();
  const [data, setData] = useState({});

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

  function sdTemplate() {
    questionForm.current.value = "Using stable diffusion, create an image that captures the essence of a happy cat in a whimsical and playful way. The cat should have a big, wide smile on its face, with its eyes bright and gleaming with joy. It should be in a relaxed and content pose, possibly lounging in the sun or playing with a favorite toy. The background should be colorful and vibrant, adding to the overall sense of happiness and cheerfulness in the scene. The image should evoke a sense of warmth and joy, making the viewer smile and feel uplifted. Be sure to focus on capturing the unique personality and charm of the cat, showcasing its playful and lovable nature."
  }

  function dalleTemplate() {
    questionForm.current.value = "Using dall-e generate a picture of a happy cat."
  }

  function describeTemplate() {
    questionForm.current.value = "Describe this image, be detailed."
  }

  function avatarNoirTemplate() {
    questionForm.current.value = "Draw an avatar, film noir style, ink sketch|vector, highly detailed, sharp focus, ultra sharpness, monochrome, high contrast, dramatic shadows, 1940s style, mysterious, cinematic"
    negativePromptForm.current.value = "(lowres, low quality, worst quality:1.2), (text:1.2), watermark, (frame:1.2), deformed, ugly, deformed eyes, blur, out of focus, blurry, deformed cat, deformed, photo, anthropomorphic cat, monochrome, photo, pet collar, gun, weapon, blue, 3d, drones, drone, buildings in background, green"
  }

  function avatarMarsTemplate() {
    questionForm.current.value = "Draw an avatar, post-apocalyptic. Mars Colony, Scavengers roam the wastelands searching for valuable resources, rovers, bright morning sunlight shining, (detailed) (intricate) (8k) (HDR) (cinematic lighting) (sharp focus)"
    negativePromptForm.current.value = "(lowres, low quality, worst quality:1.2), (text:1.2), watermark, (frame:1.2), deformed, ugly, deformed eyes, blur, out of focus, blurry, deformed cat, deformed, photo, anthropomorphic cat, monochrome, photo, pet collar, gun, weapon, blue, 3d, drones, drone, buildings in background, green"
  }

  function avatarVibrantTemplate() {
    questionForm.current.value = "Draw an avatar, vibrant colorful, ink sketch|vector|2d colors, at nightfall, sharp focus, highly detailed, sharp focus, the clouds,colorful,ultra sharpness"
    negativePromptForm.current.value = "(lowres, low quality, worst quality:1.2), (text:1.2), watermark, (frame:1.2), deformed, ugly, deformed eyes, blur, out of focus, blurry, deformed cat, deformed, photo, anthropomorphic cat, monochrome, photo, pet collar, gun, weapon, blue, 3d, drones, drone, buildings in background, green"
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
      isEnableBoostForm.current.checked = true;
    } else {
      isEnableBoostForm.current.checked = false;
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
      body = {
        "question": question,
        "negative": negativePromptForm.current.value,
        "boost": isEnableBoostForm.current.checked
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
    document.title = 'RESTAI - Vision - ' + projectName;
    fetchProject(projectName);
  }, [projectName]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1><MdOutlineImage size="1.3em" /> Vision - {projectName}</h1>
        <Row>
          {data.human_description &&
            <Col sm={12}>
              <b>Project description:</b><br />
              <span style={{ whiteSpace: "pre-line" }}>{data.human_description}</span>
            </Col>
          }
        </Row>
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
              <InputGroup>
                <InputGroup.Text>{file ? "Question" : "Prompt"}</InputGroup.Text>
                <Form.Control ref={questionForm} rows="7" as="textarea" aria-label="Question textarea" defaultValue={data.default_prompt ? data.default_prompt : ""}/>
              </InputGroup>
              <InputGroup>
                <InputGroup.Text>{"Negative Prompt"}</InputGroup.Text>
                <Form.Control ref={negativePromptForm} rows="4" as="textarea" aria-label="Negative Prompt textarea" defaultValue={"(lowres, low quality, worst quality:1.2), (text:1.2), watermark, (frame:1.2), deformed, ugly, deformed eyes, blur, out of focus, blurry, deformed cat, deformed, photo, anthropomorphic cat, monochrome, photo, pet collar, gun, weapon, blue, 3d, drones, drone, buildings in background, green"} />
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
              <Button variant="dark" onClick={avatarNoirTemplate} size="sm">Avatar Noir (local)</Button>
              <Button variant="dark" onClick={avatarMarsTemplate} size="sm">Avatar Mars (local)</Button>
              <Button variant="dark" onClick={avatarVibrantTemplate} size="sm">Avatar Vibrant (local)</Button>

            </Col>
          </Row>
          <hr />
          <Row style={{ marginTop: "20px" }}>
            <Col sm={10} style={{ display: "inline-flex" }}>
              <Form.Group as={Col} controlId="formGridAdmin">
                <Form.Check ref={isEnableBoostForm} type="checkbox" label="Enable Prompt Booster" />
                <Link title="Enable prompt booster. Uses AI to boost user's prompt with more details and content."><MdInfoOutline size="1.4em" /></Link>
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

export default Vision;