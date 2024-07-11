import { Container, Row, Col, Accordion, Tabs, Tab } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';
import { toast } from 'react-toastify';
import { PiMagnifyingGlassPlus } from "react-icons/pi";
import { CopyBlock, monoBlue } from "react-code-blocks";

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

  const phpquestioncode = () => {
    return `<?php

$apiKey = 'YOUR_API_KEY';

$data = [
  'question' => 'What is the capital of France?',
];

$ch = curl_init('https://ai.group.team.blue/xpto/question');

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Authorization: Bearer ' . $apiKey,
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
  echo 'Error:' . curl_error($ch);
} else {
  $responseData = json_decode($response, true);
  print_r($responseData);
}

curl_close($ch);`;
  }

  const phpchatcode = () => {
    return `<?php

$apiKey = 'YOUR_API_KEY';

$data = [
  'question' => 'What is the capital of France?',
  //'id' => 'XXXXXXXXXXX' //First iteration should not contain ID it will start a new chat history. Use the ID returned in the first response to continue the chat. 
];

$ch = curl_init('https://ai.group.team.blue/xpto/chat');

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Authorization: Bearer ' . $apiKey,
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
  echo 'Error:' . curl_error($ch);
} else {
  $responseData = json_decode($response, true);
  print_r($responseData);
}

curl_close($ch);`;
  }

  useEffect(() => {
    document.title = 'RESTAI - Project - ' + projectName;
    fetchProject(projectName);
  }, [projectName]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Tabs
          defaultActiveKey="php"
          id="uncontrolled-tab-example"
          className="mb-3"
        >
          <Tab eventKey="php" title="PHP">
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>PHP Question (stateless) Usage</Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col sm={12}>
                      <CopyBlock
                        text={phpquestioncode()}
                        language="php"
                        theme={monoBlue}
                        codeBlock
                      />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>PHP Chat (stateful) Usage</Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col sm={12}>
                      <CopyBlock
                        text={phpchatcode()}
                        language="php"
                        theme={monoBlue}
                        codeBlock
                      />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Tab>
          <Tab eventKey="python" title="Python">
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}

export default Api;