import { Card, Divider, Box, Grid, TextField, Button, MenuItem, Switch, Autocomplete, Slider, Typography } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import { H4 } from "app/components/Typography";
import { useState, useEffect, Fragment } from "react";
import useAuth from "app/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export default function ProjectEdit({ project, projects, info }) {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const auth = useAuth();
  const [state, setState] = useState({});
  const [tools, setTools] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    var opts = {
      "name": project.name,
      "llm": state.llm,
      "human_description": state.human_description,
      "human_name": state.human_name,
      "guard": state.guard || "",
      "censorship": state.censorship || "",
      "public": state.public,
      "default_prompt": state.default_prompt || ""
    }

    if (project.type === "rag" || project.type === "inference" || project.type === "ragsql" || project.type === "agent") {
      opts.system = state.system
    }

    //if (project.type === "ragsql") {
    //  opts.connection = connectionForm.current.value
    //  opts.tables = tablesForm.current.value
    //}

    if (project.type === "agent") {
      opts.tools = state.tools
    }

    if (project.type === "rag") {
      opts.colbert_rerank = state.colbert_rerank
      opts.llm_rerank = state.llm_rerank
      opts.score = parseFloat(state.score)
      opts.k = parseInt(state.k)
      opts.cache = state.cache
      opts.cache_threshold = parseFloat(state.cache_threshold) / 100

      if (opts.censorship.trim() === "") {
        delete opts.censorship;
      }
    }

    fetch(url + "/projects/" + project.name, {
      method: 'PATCH',
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
      .then(() => {
        navigate("/project/" + project.name);
      }).catch(err => {
        toast.error(err.toString());
      });
  }

  const fetchTools = () => {
    return fetch(url + "/tools/agent", { headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }) })
      .then((res) => res.json())
      .then((d) => {
        setTools(d)
      }).catch(err => {
        console.log(err.toString());
        toast.error("Error fetching Tools");
      });
  }

  const handleChange = (event) => {
    if (event && event.persist) event.persist();
    setState({ ...state, [event.target.name]: (event.target.type === "checkbox" ? event.target.checked : event.target.value) });
  };

  useEffect(() => {
    setState(project);
    fetchTools();
  }, [project]);

  return (
    <Card elevation={3}>
      <H4 p={2}>Edit project - {project.name}</H4>

      <Divider sx={{ mb: 1 }} />

      <form onSubmit={handleSubmit}>
        <Box margin={3}>
          <Grid container spacing={3}>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="human_name"
                label="Project Human Name"
                variant="outlined"
                onChange={handleChange}
                value={state.human_name}
              />
            </Grid>

            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="human_description"
                label="Project Human Description"
                variant="outlined"
                onChange={handleChange}
                value={state.human_description}
              />
            </Grid>

            <Grid item sm={12} xs={12}>
              <Divider sx={{ mb: 1 }} />
            </Grid>

            {state.public !== undefined && (
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  label="Shared"
                  control={
                    <Switch
                      checked={state.public}
                      name="public"
                      inputProps={{ "aria-label": "secondary checkbox controlled" }}
                      onChange={handleChange}
                    />
                  }
                />
              </Grid>
            )}

            {state.llm !== undefined && (
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  select
                  name="llm"
                  label="LLM"
                  variant="outlined"
                  onChange={handleChange}
                  value={state.llm}
                  defaultValue={state.llm}
                >
                  {info.llms.map((item, ind) => (
                    <MenuItem value={item.name} key={item.name}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {(state.type === "rag" || state.type === "inference" || state.type === "ragsql" || state.type === "agent") && (
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  name="system"
                  label="System Message"
                  variant="outlined"
                  onChange={handleChange}
                  value={state.system}
                  multiline={true}
                />
              </Grid>
            )}


            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="default_prompt"
                label="Default Prompt"
                variant="outlined"
                onChange={handleChange}
                value={state.default_prompt}
              />
            </Grid>

            <Grid item sm={12} xs={12}>
              <Divider sx={{ mb: 1 }} />
            </Grid>

            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="guard"
                label="Prompt Guard Project"
                variant="outlined"
                onChange={handleChange}
                value={state.guard}
              />
            </Grid>

            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="censorship"
                label="Censhorship Message"
                variant="outlined"
                onChange={handleChange}
                value={state.censorship}
              />
            </Grid>

            {state.type === "rag" && (
              <div>
                <Grid item sm={12} xs={12}>
                  <Divider sx={{ mb: 1 }} />
                </Grid>
              </div>
            )}

            {state.type === "agent" && (
              <Fragment>
                <Grid item sm={12} xs={12}>
                  <Divider sx={{ mb: 1 }} />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <FormControlLabel
                    label="Tools"
                    sx={{ ml: 0 }}
                    control={
                      <Autocomplete
                        multiple
                        id="tags-standard"
                        name="tools"
                        options={tools.map((tool) => tool.name)}
                        getOptionLabel={(option) => option}
                        onChange={(event, newValue) => {
                          setState({ ...state, ["tools"]: newValue.join(",") });
                        }}
                        defaultValue={state.tools ? state.tools.split(",") : []}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            variant="standard"
                            label=""
                            placeholder=""
                          />
                        )}
                      />
                    }
                  />
                </Grid>
              </Fragment>
            )}

            {state.type === "rag" && (
              <Fragment>
                <Grid item sm={12} xs={12}>
                  <Divider sx={{ mb: 1 }} />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Typography id="discrete-slider" gutterBottom>
                    K Value
                  </Typography>
                  <Slider
                    defaultValue={state.k}
                    onChange={handleChange}
                    aria-labelledby="input-slider"
                    step={1}
                    min={0}
                    max={10}
                    valueLabelDisplay="auto"
                    style={{ width: "400px" }}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    name="score"
                    label="Cutoff Score"
                    variant="outlined"
                    onChange={handleChange}
                    value={state.score}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Typography id="discrete-slider" gutterBottom>
                    Cache Threshold
                  </Typography>
                  <Slider
                    defaultValue={state.cache_threshold * 100}
                    onChange={handleChange}
                    aria-labelledby="input-slider"
                    step={1}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    style={{ width: "400px" }}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <FormControlLabel
                    label="Cache"
                    control={
                      <Switch
                        checked={state.cache}
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    }
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <FormControlLabel
                    label="LLM Rerank"
                    control={
                      <Switch
                        checked={state.llm_rerank}
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    }
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <FormControlLabel
                    label="Colbert Rerank"
                    control={
                      <Switch
                        checked={state.colbert_rerank}
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    }
                  />
                </Grid>
              </Fragment>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained">
                Save Changes
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }} onClick={() => { navigate("/project/" + project.name) }}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Card>
  );
}
