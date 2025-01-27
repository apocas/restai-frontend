import { useState, useEffect } from "react";
import { styled, Box } from "@mui/material";
import useAuth from "app/hooks/useAuth";
import TeamInfo from "./components/TeamInfo";
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

export default function TeamViewInfo() {
  const { id } = useParams();
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState({});
  const [info, setInfo] = useState({ "version": "", "embeddings": [], "llms": [], "loaders": [] });
  const auth = useAuth();

  const fetchTeam = (team_id) => {
    return fetch(url + "/teams/" + team_id, { headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }) })
      .then((res) => res.json())
      .then((d) => {
        setTeam(d)
        return d
      }).catch(err => {
        toast.error(err.toString());
      });
  }

  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RESTai") + ' - Team - ' + id;
    fetchTeam(id);
  }, [id]);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Teams", path: "/teams" }, { name: id, path: "/team/" + id }]} />
      </Box>

      <ContentBox className="analytics">
        <TeamInfo team={team} projects={projects} info={info} />
      </ContentBox>
    </Container>
  );
}
