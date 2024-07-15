import { Container, Row, Form, Col, Button } from 'react-bootstrap';
import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import { AuthContext } from '../../common/AuthProvider.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { toast } from 'react-toastify';
import { AiOutlineSave } from "react-icons/ai";
import { MdInfoOutline } from "react-icons/md";

function Edit() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState({ projects: [] });
  const classnameForm = useRef(null)
  const optionsForm = useRef(null)
  const privacyForm = useRef(null)
  const typeForm = useRef(null)
  const descriptionForm = useRef(null)
  var { llmname } = useParams();
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span style={{ fontSize: "small", margin: "3px" }}>{children}</span>
    </OverlayTrigger>
  );

  const onSubmitHandler = (event) => {
    event.preventDefault();
    var update = {};

    if (classnameForm.current.value !== data.class_name) {
      update.class_name = classnameForm.current.value;
    }
    if (optionsForm.current.value !== data.options) {
      update.options = optionsForm.current.value;
    }
    if (privacyForm.current.value !== data.privacy) {
      update.privacy = privacyForm.current.value;
    }
    if (typeForm.current.value !== data.type) {
      update.type = typeForm.current.value;
    }
    if (descriptionForm.current.value !== data.description) {
      update.description = descriptionForm.current.value;
    }

    fetch(url + "/llms/" + llmname, {
      method: 'PATCH',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
      body: JSON.stringify(update),
    }).then(function (response) {
      if (!response.ok) {
        response.json().then(function (data) {
          toast.error(data.detail);
        });
        throw Error(response.statusText);
      } else {
        return response.json();
      }
    }).then(response => {
      window.location.href = "/admin/llms/" + llmname;
    }).catch(err => {
      console.log(err.toString());
      toast.error("Error updating LLM");
    });
  }

  const fetchLLM = (llmname) => {
    return fetch(url + "/llms/" + llmname, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => setData(d)
      ).catch(err => {
        console.log(err.toString());
        toast.error("Error fetching LLM");
      });
  }

  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RestAI")  + ' - Edit - ' + llmname;
    fetchLLM(llmname);
  }, [llmname]);

  useEffect(() => {
    privacyForm.current.value = data.privacy;
    typeForm.current.value = data.type;
  }, [data]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1>Edit LLM {llmname}</h1>
        <Form onSubmit={onSubmitHandler}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridUserName">
              <Form.Label>Class Name</Form.Label>
              <Form.Control type="text" ref={classnameForm} defaultValue={data.class_name ? data.class_name : ""} />
            </Form.Group>
            <Form.Group as={Col} controlId="formGridType">
              <Form.Label>Privacy<Link title="LLM privacy. Pick public for public cloud, private if the LLM is local."><MdInfoOutline size="1.4em"/></Link></Form.Label>
              <Form.Select ref={privacyForm}>
                <option>Choose...</option>
                <option key="public">public</option>
                <option key="private">private</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridType">
              <Form.Label>Type<Link title="LLM type. QA for question/answer only, chat if it supports chat mode additionally to qa. Vision for image based LLMs."><MdInfoOutline size="1.4em"/></Link></Form.Label>
              <Form.Select ref={typeForm}>
                <option>Choose...</option>
                <option key="qa">qa</option>
                <option key="chat">chat</option>
                <option key="vision">vision</option>
              </Form.Select>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridUserName">
              <Form.Label>Options</Form.Label>
              <Form.Control type="text" ref={optionsForm} defaultValue={data.options ? data.options : ""} />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridUserName">
              <Form.Label>Descrition</Form.Label>
              <Form.Control type="text" ref={descriptionForm} defaultValue={data.description ? data.description : ""} />
            </Form.Group>
          </Row>
          <Button variant="dark" type="submit" className="mb-2"><AiOutlineSave size="1.3em" /> Save</Button>
          <NavLink to={"/llms/" + llmname} >
            <Button variant="danger" style={{ marginLeft: "10px", marginTop: "-8px" }}>Cancel</Button>{' '}
          </NavLink>
        </Form>
      </Container>
    </>
  );
}

export default Edit;