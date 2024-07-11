import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navigation from './components/common/Navigation.js'
import Projects from './components/pages/Projects/Projects.js';
import Project from './components/pages/Projects/Project.js';
import ProjectsEdit from './components/pages/Projects/Edit.js';
import Chat from './components/pages/Projects/Chat.js';
import Question from './components/pages/Projects/Question.js';
import QuestionSQL from './components/pages/Projects/QuestionSQL.js';
import Vision from './components/pages/Projects/Vision.js';
import Multimodal from './components/pages/Projects/Multimodal.js';
import Inference from './components/pages/Projects/Inference.js';
import Api from './components/pages/Projects/Api.js';
import Users from './components/pages/Users/Users.js';
import User from './components/pages/Users/User.js';
import UsersEdit from './components/pages/Users/Edit.js';
import Tools from './components/pages/Tools/Tools.js';
import Library from './components/pages/Library/Library.js';
import LLMs from './components/pages/LLMs/LLMs.js';
import LLM from './components/pages/LLMs/LLM.js';
import LLMsEdit from './components/pages/LLMs/Edit.js';
import Login from './components/pages/Login/Login.js';
import Error from './components/pages/Error/Error.js';
import PrivateRoute from './components/common/PrivateRoute.js';
import AuthProvider from './components/common/AuthProvider.js';
import 'bootstrap/dist/css/bootstrap.css';
import './assets/css/index.css';
import { Container, Row, Col } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Root() {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [version, setVersion] = useState([]);

  const fetchVersion = () => {
    return fetch(url + "/version")
      .then((res) => res.json())
      .then((d) => {
        setVersion(d.version)
      }).catch(err => {
        console.log(err.toString());
      });
  }

  useEffect(() => {
    document.title = 'RESTAI - Users';
    fetchVersion();
  }, []);

  return (
    <>
      <BrowserRouter basename="/admin">
        <AuthProvider>
          <Navigation />
          <Routes>
            {/* Private Routes */}
            <Route path={'/'} element={<PrivateRoute />}>
              <Route path={`/`} element={<Projects />} />
              <Route path={`/projects`} element={<Projects />} />
              <Route path={`/projects/:projectName`} element={<Project />} />
              <Route path={`/projects/:projectName/edit`} element={<ProjectsEdit />} />
              <Route path={`/projects/:projectName/question`} element={<Question />} />
              <Route path={`/projects/:projectName/questionsql`} element={<QuestionSQL />} />
              <Route path={`/projects/:projectName/chat`} element={<Chat />} />
              <Route path={`/projects/:projectName/vision`} element={<Vision />} />
              <Route path={`/projects/:projectName/inference`} element={<Inference />} />
              <Route path={`/projects/:projectName/multimodal`} element={<Multimodal />} />
              <Route path={`/projects/:projectName/api`} element={<Api />} />
              <Route path={`/users`} element={<Users />} />
              <Route path={`/users/:username`} element={<User />} />
              <Route path={`/users/:username/edit`} element={<UsersEdit />} />
              <Route path={`/llms`} element={<LLMs />} />
              <Route path={`/llms/:llmname`} element={<LLM />} />
              <Route path={`/llms/:llmname/edit`} element={<LLMsEdit />} />
              <Route path={`/tools`} element={<Tools />} />
              <Route path={`/library`} element={<Library />} />
            </Route>
            {/* Public Routes */}
            <Route
              path={`/login`}
              element={<Login />}
            />
            <Route
              path={`/error`}
              element={<Error />}
            />
            <Route
              path={`*`}
              element={<Navigate to="/error" />}
            />
          </Routes>

          <Container style={{ marginTop: "20px", marginBottom: "20px", textAlign: "center" }}>
            <ToastContainer
              position="top-right"
              autoClose={8000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Row>
              <Col sm={12}>
                <hr />
                Powered by <a href="https://github.com/apocas/restai" target="_blank" rel="noreferrer"><b>RestAI</b>, so many 'A's and 'I's, so little time...</a><br/>
                {(version) && <span style={{fontSize: "0.7rem"}}>Core v{version + ', UI v' + process.env.REACT_APP_VERSION}</span>}
              </Col>
            </Row>
          </Container>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);