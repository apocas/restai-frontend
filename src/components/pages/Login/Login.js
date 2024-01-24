import { Form, Button, Alert } from "react-bootstrap";
import React, { useState, useContext } from "react";
import { Navigate } from 'react-router-dom';
import "./login.css";
import restaiLogo from '../../../assets/img/restai-logo.png';
import { AuthContext } from '../../common/AuthProvider.js';

function Login() {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const { checkAuth, login } = useContext(AuthContext);
  const [inputUsername, setInputUsername] = useState("");
  const [error, setError] = useState([]);
  const [inputPassword, setInputPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    login(inputUsername, inputPassword)
    await delay(500);
    setShow(true);
    setLoading(false);
  };

  const handleNextClick = async () => {
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
        setError([...error, { "functionName": "onSubmitHandler", "error": err.toString() }]);
      });
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return !checkAuth() ? (
    <>
      {error.length > 0 &&
        <Alert variant="danger" style={{ textAlign: "center" }}>
          {JSON.stringify(error)}
        </Alert>
      }
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
            <Form.Check type="checkbox" label="Remember me" />
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