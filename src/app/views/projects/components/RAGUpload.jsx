import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, Grid, MenuItem, styled, TextField } from "@mui/material";
import Publish from "@mui/icons-material/Publish";
import { useDropzone } from "react-dropzone";
import { toast } from 'react-toastify';
import { H4 } from "app/components/Typography";
import useAuth from "app/hooks/useAuth";
import { FlexAlignCenter, FlexBox } from "app/components/FlexBox";
import { FileUpload } from "@mui/icons-material";
import { convertHexToRGB } from "app/utils/utils";
import { useNavigate } from "react-router-dom";

const Form = styled("form")({
  paddingLeft: "16px",
  paddingRight: "16px"
});

const DropZone = styled(FlexAlignCenter)(({ isDragActive, theme }) => ({
  height: 160,
  width: "100%",
  cursor: "pointer",
  borderRadius: "4px",
  marginBottom: "16px",
  transition: "all 350ms ease-in-out",
  border: `2px dashed rgba(${convertHexToRGB(theme.palette.text.primary)}, 0.3)`,
  "&:hover": {
    background: `rgb(${convertHexToRGB(theme.palette.text.primary)}, 0.2) !important`
  },
  background: isDragActive ? "rgb(0, 0, 0, 0.15)" : "rgb(0, 0, 0, 0.01)"
}));

export default function RAGUpload({ project }) {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const navigate = useNavigate();
  const auth = useAuth();
  const [files, setFiles] = useState([]);
  const [state, setState] = useState({ "chunksize": "512", "splitter": "token" });
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    "maxFiles": 1,
    "multiple": false
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("splitter", state.splitter);
    formData.append("chunks", state.chunksize);

    fetch(url + "/projects/" + project.name + "/embeddings/ingest/upload", {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }),
      body: formData,
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
        window.location.reload();
      }).catch(err => {
        toast.error(err.toString());
      }).finally(() => {
      });
  };

  const handleChange = (event) => {
    if (event && event.persist) event.persist();
    setState({ ...state, [event.target.name]: event.target.value });
  };

  useEffect(() => {
    setFiles(acceptedFiles);
  }, [acceptedFiles]);

  return (
    <Card elevation={3}>
      <FlexBox>
        <FileUpload sx={{ ml: 2, mt: 2 }} />
        <H4 sx={{ p: 2 }}>
          Ingest data
        </H4>
      </FlexBox>

      <Divider />

      <Form onSubmit={handleSubmit}>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item sm={12} xs={12}>
            <TextField
              fullWidth
              select
              name="splitter"
              label="Splitter"
              variant="outlined"
              onChange={handleChange}
              value={state.splitter}
              defaultValue={state.splitter}
              sx={{ mb: 2 }}
            >
              {["token", "sentence"].map((item, ind) => (
                <MenuItem value={item} key={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              name="chunksize"
              label="Chunk Size"
              variant="outlined"
              onChange={handleChange}
              value={state.chunksize}
              defaultValue={state.chunksize}
              sx={{ mb: 2 }}
            >
              {["126", "256", "512", "1024", "2048"].map((item, ind) => (
                <MenuItem value={item} key={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>

            <DropZone {...getRootProps()}>
              <input {...getInputProps()} />
              <FlexBox alignItems="center" flexDirection="column">
                <Publish sx={{ color: "text.secondary", fontSize: "48px" }} />
                {files.length ? (
                  <span>{files[0].name}</span>
                ) : (
                  <span>Drop file</span>
                )}
              </FlexBox>
            </DropZone>
          </Grid>
        </Grid>

        <Button type="submit" color="primary" variant="contained" sx={{ mb: 2, px: 6 }}>
          Ingest
        </Button>
      </Form>
    </Card>
  );
}

