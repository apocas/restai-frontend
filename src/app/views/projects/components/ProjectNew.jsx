import { useState } from "react";
import useAuth from "app/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  MenuItem,
  styled,
  Tab,
  Tabs,
  TextField
} from "@mui/material";

import { H4 } from "app/components/Typography";
import { toast } from 'react-toastify';

const Form = styled("form")(() => ({ padding: "16px" }));

export default function ProjectNew({ projects, info }) {
  const typeList = ["rag", "inference", "agent", "ragsql", "vision", "router"];
  const vectorstoreList = ["redis", "chroma"];
  const auth = useAuth();
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState("0");
  const [state, setState] = useState({});

  const url = process.env.REACT_APP_RESTAI_API_URL || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(state);

    var opts = {
      "name": state.projectname,
      "llm": state.projectllm,
      "type": state.projecttype
    }

    if (state.projecttype === "rag") {
      opts.embeddings = state.projectembeddings;
      opts.vectorstore = state.projectvectorstore;
    }

    fetch(url + "/projects", {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth.user.token }),
      body: JSON.stringify(opts),
    })
      .then(function (response) {
        if (!response.ok) {
          response.json().then(function (data) {
            toast.error(data.detail);
          });
          throw Error(response.statusText);
        } else {
          return response.json();
        }
      })
      .then((response) => {
        navigate("/project/" + response.project);
      }).catch(err => {
        toast.error(err.toString());
      });

  };

  const handleChange = (event) => {
    if (event && event.persist) event.persist();
    setState({ ...state, [event.target.name]: event.target.value });
  };

  return (
    <Card elevation={3}>
      <H4 p={2}>Add a New Project</H4>

      <Divider sx={{ mb: 1 }} />

      <Form onSubmit={handleSubmit}>
        <Grid container spacing={3} alignItems="center">
          <Grid item md={2} sm={4} xs={12}>
            Name
          </Grid>

          <Grid item md={10} sm={8} xs={12}>
            <TextField
              size="small"
              name="projectname"
              variant="outlined"
              label="Project Name"
              onChange={handleChange}
            />
          </Grid>

          <Grid item md={2} sm={4} xs={12}>
            Type
          </Grid>

          <Grid item md={10} sm={8} xs={12}>
            <TextField
              select
              size="small"
              name="projecttype"
              label="Type"
              variant="outlined"
              onChange={handleChange}
              sx={{ minWidth: 188 }}
            >
              {typeList.map((item, ind) => (
                <MenuItem value={item} key={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {state.projecttype && (
            <>
              <Grid item md={2} sm={4} xs={12}>
                LLM
              </Grid>

              <Grid item md={10} sm={8} xs={12}>
                <TextField
                  select
                  size="small"
                  name="projectllm"
                  label="LLM"
                  variant="outlined"
                  onChange={handleChange}
                  sx={{ minWidth: 188 }}
                >
                  {info.llms.filter(item =>
                    state.projecttype === "vision"
                      ? item.type === "vision"
                      : item.type !== "vision"
                  ).map((item, ind) => (
                    <MenuItem value={item.name} key={item.name}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
        </Grid>

        <Tabs
          value={tabIndex}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mt: 0, mb: 0 }}>

          {state.projecttype === "rag" && (
            <Tab key="0" value="0" label="RAG" sx={{ textTransform: "capitalize" }} />
          )}
        </Tabs>



        {state.projecttype === "rag" && tabIndex === "0" && (
          <Grid container spacing={3} alignItems="center">
            <Grid item md={2} sm={4} xs={12}>
              Embeddings
            </Grid>

            <Grid item md={10} sm={8} xs={12}>
              <TextField
                select
                size="small"
                name="projectembeddings"
                label="Embeddings"
                variant="outlined"
                sx={{ minWidth: 188 }}
                onChange={handleChange}
              >
                {info.embeddings.map((item, ind) => (
                  <MenuItem value={item.name} key={item.name}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={2} sm={4} xs={12}>
              Vectorstore
            </Grid>

            <Grid item md={10} sm={8} xs={12}>
              <TextField
                select
                size="small"
                name="projectvectorstore"
                label="Vectorstore"
                variant="outlined"
                sx={{ minWidth: 188 }}
                onChange={handleChange}
              >
                {vectorstoreList.map((item, ind) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        )}

        <Box mt={3}>
          <Button color="primary" variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </Form>
    </Card>
  );
}
