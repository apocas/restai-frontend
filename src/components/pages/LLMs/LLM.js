import { Container, Table, Row, Form, Col, Button, ListGroup, Alert } from 'react-bootstrap';
import { useParams, NavLink } from "react-router-dom";
import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { toast } from 'react-toastify';

function LLM() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState({ projects: [] });
  var { llmname } = useParams();
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth() || { username: null, admin: null };

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <a href="#" style={{ fontSize: "small", margin: "3px" }}>{children}</a>
    </OverlayTrigger>
  );

  const deleteClick = () => {
    if (window.confirm("Delete " + llmname + "?")) {
      fetch(url + "/llms/" + llmname, {
        method: 'DELETE',
        headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth })
      }).then(() => {
        window.location.href = "/admin/llms/";
      }
      ).catch(err => {
        console.log(err.toString());
        toast.error("Error deleting LLM"); 
      });
    }
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
    document.title = 'LLM - ' + llmname;
    fetchLLM(llmname);
  }, [llmname]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Row style={{ marginTop: "20px" }}>
          <Col sm={12}>
            <h1>
              Details
              <NavLink to={"/llms/" + llmname + "/edit"} >
                {user.admin && <Button variant="dark" style={{ marginLeft: "5px" }}>Edit</Button>}
              </NavLink>
              <Button variant="alert" style={{ marginLeft: "5px" }} onClick={() => deleteClick()}>Delete</Button>
            </h1>

            <ListGroup>
              <ListGroup.Item><b>Name:</b> {data.name}</ListGroup.Item>
              <ListGroup.Item><b>Class Name:</b> {data.class_name}</ListGroup.Item>
              <ListGroup.Item><b>Options:</b> {data.options}</ListGroup.Item>
              <ListGroup.Item><b>Privacy:</b> {data.privacy}</ListGroup.Item>
              <ListGroup.Item><b>Type:</b> {data.type}</ListGroup.Item>
              <ListGroup.Item><b>Description:</b> {data.description}</ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Container >
    </>
  );
}

export default LLM;