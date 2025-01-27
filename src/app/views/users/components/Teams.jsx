import {
  Box,
  Card,
  Grid,
  Button,
  Divider,
  TextField,
  styled,
  MenuItem
} from "@mui/material";
import { useState } from "react";
import { H5, Paragraph } from "app/components/Typography";
import { FlexBetween, FlexBox } from "app/components/FlexBox";
import { convertHexToRGB } from "app/utils/utils";
import QRCode from "react-qr-code";
import useAuth from "app/hooks/useAuth";
import { toast } from 'react-toastify';

export default function Preferences({ user, teams }) {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const auth = useAuth();
  const [state, setState] = useState({});

  const StyledP = styled(Paragraph)(({ theme }) => ({
    color: theme.palette.text.secondary,
  }));

  const StyledButton = styled(Button)(({ theme }) => ({
    paddingLeft: "20px",
    paddingRight: "20px",
    transition: "all 250ms",
    color: theme.palette.error.main,
    background: `rgba(${convertHexToRGB(theme.palette.error.main)}, 0.15)`,
    "&:hover": {
      color: "#ffffff",
      fallbacks: [{ color: "white !important" }],
      background: `${theme.palette.error.main} !important`,
      backgroundColor: `${theme.palette.error.main} !important`,
    },
  }));

  const diassoc = (team) => {
    var updatedTeams = user.teams.filter((p) => p.team_id !== team.team_id);
    user.teams = updatedTeams;
    //setProjs(updatedTeams);
    onSubmitHandler();
  }

  const onSubmitHandler = (event) => {
    if (event)
      event.preventDefault();


    fetch(url + "/users/" + user.username, {
      method: 'PATCH',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth.user.token }),
      body: JSON.stringify({
        "teams": user.teams.map((p) => p.team_id)
      }),
    })
      .then(response => {
        window.location.href = "/admin/user/" + user.username;
      }).catch(err => {
        toast.error(err.toString());
      });

  }

  const handleChange = (event) => {
    if (event && event.persist) event.persist();
    setState({ ...state, [event.target.name]: (event.target.type === "checkbox" ? event.target.checked : event.target.value) });
  };

  return (
    <Card>
      <H5 padding={3}>User Preferences</H5>
      <Divider />

      <Box margin={3}>
        {auth.user.superadmin === true &&
          <Grid container spacing={3}>
            <Grid item sm={6} xs={12}>
              <TextField
                select
                size="small"
                name="addteam"
                label="Team"
                variant="outlined"
                onChange={handleChange}
                sx={{ minWidth: 188 }}
              >
                {teams.map((item, ind) => (
                  <MenuItem value={item.id} key={item.name}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item sm={6} xs={12}>
              <Button type="submit" variant="contained" mt={1} onClick={() => { user.teams.push({ "team_id": state.addteam }); onSubmitHandler() }}>
                Associate
              </Button>
            </Grid>
          </Grid>
        }
      </Box>
      <Divider />
      <Box margin={3}>
        <Grid container spacing={3}>
          {user.teams.map((team) => (
            <Grid item sm={6} xs={12}>
              <Card>
                <FlexBetween p="24px" m={-1} flexWrap="wrap">
                  <FlexBox alignItems="center" m={1}>
                    <QRCode
                      size={128}
                      style={{ width: 55, height: 55 }}
                      value={team.name}
                      viewBox={`0 0 256 256`}
                    />

                    <Box ml={2}>
                      <H5>{team.team_id}</H5>
                      <StyledP sx={{ mt: 1, fontWeight: "normal", textTransform: "capitalize" }}>
                        {(team.name || "").toLowerCase()}
                      </StyledP>
                    </Box>
                  </FlexBox>

                  {auth.user.superadmin === true &&
                    <Box m={1} display="flex">
                      <StyledButton size="small" onClick={() => { diassoc(team) }} >Dissociate</StyledButton>
                    </Box>
                  }
                </FlexBetween>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  );
}
