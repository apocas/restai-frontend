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

  const replaceVars = (code) => {
    code = code.replaceAll('<URL>', window.location.protocol + "//" + window.location.host);
    code = code.replaceAll('<PROJECT>', projectName);
    code = code.replaceAll('<QUESTION>', data.default_prompt || 'Who was born first? Chicken or egg?');
    return code;
  }

  const pythonquestioncode = () => {
    return replaceVars(`import requests

api_key = 'YOUR_API_KEY'

data = {
    'question': '<QUESTION>',
}

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {api_key}',
}

response = requests.post('<URL>/projects/<PROJECT>/question', json=data, headers=headers)

if response.status_code != 200:
    print('Error:', response.status_code, response.text)
else:
    response_data = response.json()
    print(response_data)`);
  }

  const pythonchatcode = () => {
    return replaceVars(`import requests

api_key = 'YOUR_API_KEY'

data = {
    'question': '<QUESTION>',
      #'id' => 'XXXXXXXXXXX' //First iteration should not contain ID it will start a new chat history. Use the ID returned in the first response to continue the chat.
}

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {api_key}',
}

response = requests.post('<URL>/projects/<PROJECT>/question', json=data, headers=headers)

if response.status_code != 200:
    print('Error:', response.status_code, response.text)
else:
    response_data = response.json()
    print(response_data)`);
  }

  const phpquestioncode = () => {
    return replaceVars(`<?php

$apiKey = 'YOUR_API_KEY';

$data = [
  'question' => '<QUESTION>',
];

$ch = curl_init('<URL>/projects/<PROJECT>/chat');

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

curl_close($ch);`);
  }

  const phpchatcode = () => {
    return replaceVars(`<?php

$apiKey = 'YOUR_API_KEY';

$data = [
  'question' => '<QUESTION>',
  //'id' => 'XXXXXXXXXXX' //First iteration should not contain ID it will start a new chat history. Use the ID returned in the first response to continue the chat. 
];

$ch = curl_init('<URL>/projects/<PROJECT>/chat');

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

curl_close($ch);`);
  }

  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RestAI") + ' - Project - ' + projectName;
    fetchProject(projectName);
  }, [projectName]);

  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <Row style={{ marginBottom: "15px" }}>
          <Col sm={12}>
            {'Generate an API key '}<b><a href={"/admin/users/" + user.username}>here</a></b>.
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
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
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Python Question (stateless) Usage</Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col sm={12}>
                          <CopyBlock
                            text={pythonquestioncode()}
                            language="php"
                            theme={monoBlue}
                            codeBlock
                          />
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Python Chat (stateful) Usage</Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col sm={12}>
                          <CopyBlock
                            text={pythonchatcode()}
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
            </Tabs>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Api;