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
  TextField
} from "@mui/material";
import { H4 } from "app/components/Typography";
import { toast } from 'react-toastify';

const Form = styled("form")(() => ({ padding: "16px" }));

export default function EmbeddingNew({ projects, info }) {
  const auth = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({});

  const url = process.env.REACT_APP_RESTAI_API_URL || "";

  const handleSubmit = async (event) => {
    event.preventDefault();

    fetch(url + "/teams", {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth.user.token }),
      body: JSON.stringify({
        "name": state.name,
        "description": state.description
      })
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
        navigate("/team/" + response.id);
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
      <H4 p={2}>Add a New team</H4>

      <Divider sx={{ mb: 1 }} />

      <Form onSubmit={handleSubmit}>
        <Grid container spacing={3} alignItems="center">
          <Grid item md={2} sm={4} xs={12}>
            Name
          </Grid>

          <Grid item md={10} sm={8} xs={12}>
            <TextField
              size="small"
              name="name"
              variant="outlined"
              label="Name"
              onChange={handleChange}
            />
          </Grid>

          <Grid item md={2} sm={4} xs={12}>
            Description
          </Grid>

          <Grid item md={10} sm={8} xs={12}>
            <TextField
              size="small"
              name="description"
              variant="outlined"
              label="Description"
              onChange={handleChange}
            />
          </Grid>

        </Grid>

        <Box mt={3}>
          <Button color="primary" variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </Form>
    </Card>
  );
}
