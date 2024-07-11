import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import { toast } from 'react-toastify';
import { PiMagnifyingGlassPlus } from "react-icons/pi";

function Api() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState({});
  var { projectName } = useParams();
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();


  const fetchProject = (projectName) => {
    return fetch(url + "/projects/" + projectName, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        return d
      }).catch(err => {
        toast.error(err.toString());
      });
  }

  useEffect(() => {
    document.title = 'RESTAI - Project - ' + projectName;
    fetchProject(projectName);
  }, [projectName]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Row style={{ marginTop: "20px" }}>
          <Col sm={12}>
            <h1><PiMagnifyingGlassPlus size="1.2em" /> Python</h1>
          </Col>
        </Row>
        
        <Row>
          <Col sm={12}>
            
          </Col>
        </Row>
      </Container >
    </>
  );
}

export default Api;