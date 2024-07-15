import { Container, Row, Form, Col, Button } from 'react-bootstrap';
import React, { useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from '../../common/AuthProvider.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { toast } from 'react-toastify';
import { AiOutlineSave } from "react-icons/ai";
import { MdInfoOutline } from "react-icons/md";

function Edit() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const passwordForm = useRef(null)
  const ssoForm = useRef(null)
  const isadminForm = useRef(null)
  const isprivateForm = useRef(null)
  var { username } = useParams();
  const { logout, getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();

  const Link = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <a href="#" style={{ fontSize: "small", margin: "3px" }}>{children}</a>
    </OverlayTrigger>
  );

  // TODO: response handling
  const onSubmitHandler = (event) => {
    event.preventDefault();
    var logoutf = false;
    var update = {};

    if (user.admin) {
      update.is_admin = isadminForm.current.checked
      update.is_private = isprivateForm.current.checked
    }

    if (passwordForm.current.value !== "") {
      update.password = passwordForm.current.value
      if (user.username === username) {
        logoutf = true;
      }
    }

    if (ssoForm.current.value !== "") {
      update.sso = ssoForm.current.value
    }

    fetch(url + "/users/" + username, {
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
      if (logoutf === false) {
        window.location.href = "/admin/users/" + username;
      } else {
        logout();
      }
    }).catch(err => {
      toast.error(err.toString());
    });
  }

  const fetchUser = (username) => {
    return fetch(url + "/users/" + username, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => {
        if (user.admin) {
          isadminForm.current.checked = d.is_admin
          isprivateForm.current.checked = d.is_private
        }
      }
      ).catch(err => {
        toast.error(err.toString());
      });
  }

  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RestAI") + ' - Edit - ' + username;
    fetchUser(username);
  }, []);


  return (
    <>
      <Container style={{ marginTop: "20px" }}>
        <h1>Edit User ({username})</h1>
        <Form onSubmit={onSubmitHandler}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridUserName">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordForm} />
            </Form.Group>
            {user.admin &&
              <Form.Group as={Col} controlId="formGridUserName">
                <Form.Label>SSO</Form.Label>
                <Form.Control type="text" ref={ssoForm} />
              </Form.Group>
            }
            {user.admin &&
              <Form.Group as={Col} controlId="formGridAdmin">
                <Form.Check ref={isadminForm} type="checkbox" label="Admin" />
                <Link title="Admins have access to all projects and can edit all users"><MdInfoOutline size="1.4em" /></Link>
              </Form.Group>
            }
            {user.admin &&
              <Form.Group as={Col} controlId="formGridAdmin">
                <Form.Check ref={isprivateForm} type="checkbox" label="Private models only" />
                <Link title="Can only use private/local models"><MdInfoOutline size="1.4em" /></Link>
              </Form.Group>
            }
          </Row>
          <Button variant="dark" type="submit" className="mb-2"><AiOutlineSave size="1.3em" /> Save</Button>
        </Form>
      </Container>
    </>
  );
}

export default Edit;