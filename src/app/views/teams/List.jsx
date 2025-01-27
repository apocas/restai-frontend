import { useState, useEffect } from "react";
import { Grid, styled, Box } from "@mui/material";
import TeamsTable from "./components/TeamTable";
import useAuth from "app/hooks/useAuth";
import Breadcrumb from "app/components/Breadcrumb";
import { toast } from 'react-toastify';


const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const Container = styled("div")(({ theme }) => ({
  margin: 10,
  [theme.breakpoints.down("sm")]: { margin: 16 },
  "& .breadcrumb": { marginBottom: 30, [theme.breakpoints.down("sm")]: { marginBottom: 16 } }
}));


export default function Embeddings() {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [teams, setTeams] = useState([]);
  const auth = useAuth();

  const fetchTeams = () => {
    return fetch(url + "/teams", { headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }) })
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
      .then((d) => {
        setTeams(d)
      }
      ).catch(err => {
        toast.error(err.toString());
      });
  }
  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RESTai") + ' - Teams';
    fetchTeams();
  }, []);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Teams", path: "/teams" }]} />
      </Box>

      <ContentBox className="analytics">
        <Grid container spacing={3}>
          <Grid item lg={12} md={8} sm={12} xs={12}>
            <TeamsTable teams={teams} />
          </Grid>
        </Grid>
      </ContentBox>
    </Container>
  );
}
