import { useEffect } from "react";
import { Grid, styled, Box, Card, Button, Divider, Typography } from "@mui/material";
import Breadcrumb from "app/components/Breadcrumb";
import { H4 } from "app/components/Typography";
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const Container = styled("div")(({ theme }) => ({
  margin: 10,
  [theme.breakpoints.down("sm")]: { margin: 16 },
  "& .breadcrumb": { marginBottom: 30, [theme.breakpoints.down("sm")]: { marginBottom: 16 } }
}));

const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const OptionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  }
}));

const IconBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 60,
    color: theme.palette.primary.main
  }
}));

export default function LLMNewView() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RESTai") + ' - New LLM';
  }, []);

  const handleManualLLM = () => {
    navigate('/llms/new/manual');
  };

  const handleOllamaImport = () => {
    navigate('/llms/new/ollama');
  };

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "LLMs", path: "/llms" }, { name: "New LLM", path: "/llms/new" }]} />
      </Box>

      <ContentBox className="analytics">
        <H4>Choose LLM Creation Method</H4>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item md={6} sm={12} xs={12}>
            <OptionCard elevation={3} onClick={handleManualLLM}>
              <IconBox>
                <AddIcon />
              </IconBox>
              <Typography variant="h5" align="center" gutterBottom>
                Manual Configuration
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography align="center" color="textSecondary">
                Manually configure a new LLM from scratch by specifying the model type, parameters, and other settings.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleManualLLM}>
                  Create Manually
                </Button>
              </Box>
            </OptionCard>
          </Grid>
          
          <Grid item md={6} sm={12} xs={12}>
            <OptionCard elevation={3} onClick={handleOllamaImport}>
              <IconBox>
                <CloudDownloadIcon />
              </IconBox>
              <Typography variant="h5" align="center" gutterBottom>
                Import from Ollama
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography align="center" color="textSecondary">
                Connect to your Ollama instance, browse available models, and import them into RESTai with pre-configured settings.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="secondary" onClick={handleOllamaImport}>
                  Import from Ollama
                </Button>
              </Box>
            </OptionCard>
          </Grid>
        </Grid>
      </ContentBox>
    </Container>
  );
}
