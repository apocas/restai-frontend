import { Container, Row, Col, Button, ListGroup } from 'react-bootstrap';
import { useParams, NavLink } from "react-router-dom";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import { toast } from 'react-toastify';
import { PiPencilLight, PiBrain } from "react-icons/pi";
import { MdOutlineDelete } from "react-icons/md";

function LLM() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState({ projects: [] });
  var { llmname } = useParams();
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth() || { username: null, admin: null };

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
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RestAI")  + ' - LLM - ' + llmname;
    fetchLLM(llmname);
  }, [llmname]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Row style={{ marginTop: "20px" }}>
          <Col sm={12}>
            <Row>
              <Col sm={12}>
                <h1>
                  <PiBrain size="1.3em" /> LLM Details ({data.name})
                </h1>
              </Col>
            </Row>
            <Row style={{ marginBottom: "10px" }}>
              <Col sm={12}>
                {user.admin &&
                  <NavLink to={"/llms/" + llmname + "/edit"} >
                    <Button variant="dark"><PiPencilLight size="1.3em" /> Edit</Button>
                  </NavLink>
                }
                {user.admin &&
                  <Button variant="danger" style={{ marginLeft: "5px" }} onClick={() => deleteClick()}><MdOutlineDelete size="1.3em" /> Delete</Button>
                }
              </Col>
            </Row>
            <Row>
              <ListGroup>
                <ListGroup.Item><b>Name:</b> {data.name}</ListGroup.Item>
                <ListGroup.Item><b>Class Name:</b> {data.class_name}</ListGroup.Item>
                <ListGroup.Item><b>Options:</b> {data.options}</ListGroup.Item>
                <ListGroup.Item><b>Privacy:</b> {data.privacy}</ListGroup.Item>
                <ListGroup.Item><b>Type:</b> {data.type}</ListGroup.Item>
                <ListGroup.Item><b>Description:</b> {data.description}</ListGroup.Item>
              </ListGroup>
            </Row>
          </Col>
        </Row>
      </Container >
    </>
  );
}

export default LLM;