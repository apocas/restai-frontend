import { Form, Button, Alert } from "react-bootstrap";
import React, { useState, useContext, useEffect, useRef } from "react";
import { Navigate } from 'react-router-dom';
import "./login.css";
import restaiLogo from '../../../assets/img/restai-logo.png';
import { AuthContext } from '../../common/AuthProvider.js';
import { useLocalStorage } from "../../common/useLocalStorage";
import { toast } from 'react-toastify';

function Login() {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const { checkAuth, login } = useContext(AuthContext);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(null);
  const [remember, setRemember] = useLocalStorage("remember", {"username": null});
  const rememberForm = useRef(null)
  const usernameForm = useRef(null)

  const handleSubmit = async (event) => {
    event.preventDefault();
    if(type === "password") {
      setLoading(true);
      login(inputUsername, inputPassword)
      await delay(500);
      setShow(true);
      setLoading(false);
    } else {
      handleNextClick();
    }
  };

  const handleNextClick = async () => {
    if (rememberForm.current.checked) {
      setRemember({ username: inputUsername });
    } else {
      setRemember({ username: null });
    }

    setType("processsing");
    fetch(url + "/users/" + inputUsername + "/sso", {
      method: 'GET'
    })
      .then(function (response) {
        if (!response.ok) {
          setType("password");
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response && response.sso) {
          window.location.href = response.sso;
        } else {
          setType("password");
        }
      }).catch(err => {
        setType(null);
        toast.error(err.toString());
      });
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  useEffect(() => {
    document.title = 'RESTAI - Login';
    if (remember && remember.username) {
      rememberForm.current.checked = true;
      setInputUsername(remember.username);
    }
  }, [remember]);

  return !checkAuth() ? (
    <>
      <div className="sign-in__wrapper">
        <div className="sign-in__backdrop"></div>
        <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
          <img
            className="mx-auto d-block mb-2"
            src={restaiLogo}
            alt="logo"
          />
          <div className="h4 mb-2 text-center">LOGIN</div>
          {show ? (
            <Alert
              className="mb-2"
              variant="danger"
              onClose={() => setShow(false)}
              dismissible
            >
              Incorrect username or password.
            </Alert>
          ) : (
            <div />
          )}
          <Form.Group className="mb-2" controlId="username">
            <Form.Control
              type="text"
              value={inputUsername}
              placeholder="Username/Email"
              ref={usernameForm}
              onChange={(e) => setInputUsername(e.target.value)}
              required
            />
          </Form.Group>
          {type === "password" && <Form.Group className="mb-2" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={inputPassword}
              placeholder="Password"
              onChange={(e) => setInputPassword(e.target.value)}
              required
            />
          </Form.Group>
          }
          <Form.Group className="mb-2" controlId="checkbox">
            <Form.Check ref={rememberForm} type="checkbox" label="Remember me" />
          </Form.Group>
          {type === "password" &&
            <Form.Group className="mb-2" controlId="btnpwd">
              {!loading ? (
                <Button className="w-100" variant="primary" type="submit">
                  Login
                </Button>
              ) : (
                <Button className="w-100" variant="primary" type="submit" disabled>
                  Logging In...
                </Button>
              )}
            </Form.Group>
          }
          {type === null && <Form.Group className="mb-2" controlId="btnsso">
            <Button onClick={() => handleNextClick()} className="w-100" variant="primary">
              Next
            </Button>
          </Form.Group>
          }
        </Form>
      </div>
    </>
  ) : (
    <Navigate to="/" />
  );
}

export default Login;