import { useState, useEffect } from "react";
import { Grid, styled, Box } from "@mui/material";
import useAuth from "app/hooks/useAuth";
import TeamEdit from "./components/TeamEdit";
import Breadcrumb from "app/components/Breadcrumb";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';

const Container = styled("div")(({ theme }) => ({
  margin: 10,
  [theme.breakpoints.down("sm")]: { margin: 16 },
  "& .breadcrumb": { marginBottom: 30, [theme.breakpoints.down("sm")]: { marginBottom: 16 } }
}));

const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));


export default function TeamEditView() {
  const { id } = useParams();
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [team, setTeam] = useState({});
  const auth = useAuth();


  const fetchTeam = (id) => {
    return fetch(url + "/teams/" + id, { headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }) })
      .then((res) => res.json())
      .then((d) => {
        setTeam(d)
        return d
      }).catch(err => {
        toast.error(err.toString());
      });
  }

  useEffect(() => {
    fetchTeam(id);
  }, [id]);


  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Teams", path: "/teams"}, { name: "Edit " + id, path: "/team/" + id + "/edit" }]} />
      </Box>

      <ContentBox className="analytics">
        <Grid container spacing={3}>
          <Grid item lg={12} md={8} sm={12} xs={12}>
            <TeamEdit team={team} />
          </Grid>
        </Grid>
      </ContentBox>
    </Container>
  );
}
