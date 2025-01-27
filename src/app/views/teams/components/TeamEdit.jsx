import { Card, Divider, Box, Grid, TextField, Button } from "@mui/material";
import { H4 } from "app/components/Typography";
import { useState, useEffect } from "react";
import useAuth from "app/hooks/useAuth";
import { toast } from 'react-toastify';

export default function TeamEdit({ team }) {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const auth = useAuth();
  const [state, setState] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();

    var update = {};

    if (state.name !== team.name) {
      update.name = state.name;
    }
    if (state.description !== team.description) {
      update.description = state.description;
    }

    fetch(url + "/teams/" + team.id, {
      method: 'PATCH',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth.user.token }),
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
      window.location.href = "/admin/team/" + team.id;
    }).catch(err => {
      console.log(err.toString());
      toast.error("Error updating team");
    });
  }


  const handleChange = (event) => {
    if (event && event.persist) event.persist();
    setState({ ...state, [event.target.name]: event.target.value });
  };

  useEffect(() => {
    setState(team);
  }, [team]);

  return (
    <Card elevation={3}>
      <H4 p={2}>Edit Team - {team.name}</H4>

      <Divider sx={{ mb: 1 }} />

      <form onSubmit={handleSubmit}>
        <Box margin={3}>
          <Grid container spacing={3}>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="name"
                label="Name"
                variant="outlined"
                onChange={handleChange}
                value={state.name}
              />
            </Grid>

            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="description"
                label="Description"
                variant="outlined"
                onChange={handleChange}
                value={state.description}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained">
                Save Changes
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Card>
  );
}
