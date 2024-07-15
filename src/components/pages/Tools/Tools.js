import { Container, Table, Row, Col } from 'react-bootstrap';
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import { toast } from 'react-toastify';
import { HiOutlineWrench } from "react-icons/hi2";

function Tools() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState([]);
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth() || { username: null, admin: null };

  const fetchTools = () => {
    return fetch(url + "/tools/agent", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => {
        setData(d)
      }).catch(err => {
        console.log(err.toString());
        toast.error("Error fetching Tools");
      });
  }



  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RestAI") + ' - Tools';
    fetchTools();
  }, []);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1><HiOutlineWrench size="1.3em" /> Tools</h1>
        <Row>
          <Col sm={12}>
            Tools library, available to be used in Agents.
          </Col>
        </Row>
        <Row style={{ marginTop: "10px" }}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {
                data.map((tool, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        {tool.name}
                      </td>
                      <td >
                        <span style={{ whiteSpace: "pre-line" }}>{tool.description}</span>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </Row>
      </Container>

    </>
  );
}

export default Tools;