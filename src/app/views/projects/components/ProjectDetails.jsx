import { Fade, Grid } from "@mui/material";

import ProjectInfo from "./ProjectInfo";
import ProjectAI from "./ProjectAI";
import ProjectRAG from "./ProjectRAG";
import RAGUpload from "./RAGUpload";
import RAGRetrieval from "./RAGRetrieval";
import ProjectAgent from "./ProjectAgent";
import RouterDetails from "./RouterDetails";
import ProjectSecurity from "./ProjectSecurity";

export default function ProjectDetails({ project, projects, info }) {
  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item lg={4} md={6} xs={12}>
          <ProjectInfo project={project} projects={projects} />
        </Grid>

        <Grid item lg={8} md={6} xs={12}>
          <ProjectAI project={project} projects={projects} />
        </Grid>

        <Grid item lg={4} md={6} xs={12}>
          <ProjectSecurity project={project} projects={projects} info={info} />
        </Grid>

        {project.type === "rag" && (
          <>
            <Grid item lg={4} md={6} xs={12}>
              <ProjectRAG project={project} projects={projects} />
            </Grid>
            <Grid item lg={4} md={6} xs={12}>
              <RAGUpload project={project} />
            </Grid>
            {project.chunks < 30000 && (
              <Grid item lg={12} md={12} xs={12}>
                <RAGRetrieval project={project} />
              </Grid>
            )}
          </>
        )}
        {project.type === "agent" && (
          <Grid item lg={4} md={6} xs={12}>
            <ProjectAgent project={project} projects={projects} />
          </Grid>
        )}
        {project.type === "router" && (
          <Grid item lg={8} md={6} xs={12}>
            <RouterDetails project={project} projects={projects} />
          </Grid>
        )}
      </Grid>
    </Fade>
  );
}
