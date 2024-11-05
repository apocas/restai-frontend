import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, Grid, MenuItem, styled, TextField, Tabs, Tab } from "@mui/material";
import Publish from "@mui/icons-material/Publish";
import { useDropzone } from "react-dropzone";
import { toast } from 'react-toastify';
import { H4 } from "app/components/Typography";
import useAuth from "app/hooks/useAuth";
import { FlexAlignCenter, FlexBox } from "app/components/FlexBox";
import { FileUpload } from "@mui/icons-material";
import { convertHexToRGB } from "app/utils/utils";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import MUIDataTable from "mui-datatables";
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ReactJson from '@microlink/react-json-view';

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
  const [embeddings, setEmbeddings] = useState([]);
  const [rowsExpanded, setRowsExpanded] = useState([]);
  const [embedding, setEmbedding] = useState({ "ids": {}, "metadatas": {}, "documents": {} });
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({ "chunksize": "512", "splitter": "token" });
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    "maxFiles": 1,
    "multiple": false
  });
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (e, value) => setTabIndex(value);

  const fetchEmbeddings = (projectName) => {
    setEmbeddings([]);
    if (project.chunks < 30000 || !project.chunks) {
      return fetch(url + "/projects/" + projectName + "/embeddings", {
        headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth.user.token }),
      })
        .then((res) => res.json())
        .then((d) => setEmbeddings(d.embeddings)
        ).catch(err => {
          toast.error(err.toString());
        });
    }
  }

  const handleViewClick = (source) => {
    fetch(url + "/projects/" + project.name + "/embeddings/source/" + btoa(source), {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth.user.token }),
    })
      .then(response => response.json())
      .then(response => {
        response.source = source;
        setEmbedding(response);
        setTimeout(() => {
          //ref.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }).catch(err => {
        toast.error(err.toString());
      });
  }

  const handleChange = (event) => {
    if (event && event.persist) event.persist();
    setState({ ...state, [event.target.name]: event.target.value });
  };

  useEffect(() => {
    fetchEmbeddings(project.name);
  }, [acceptedFiles]);

  return (
    <Card elevation={3}>
      <FlexBox>
        <FileUpload sx={{ ml: 2, mt: 2 }} />
        <H4 sx={{ p: 2 }}>
          Embeddings Browser
        </H4>
      </FlexBox>

      <Divider />

      <MUIDataTable
        options={{
          "print": false,
          "selectableRows": "none",
          "expandableRows": true,
          "expandableRowsHeader": false,
          "expandableRowsOnClick": true,
          "download": false,
          "filter": true,
          "viewColumns": false,
          rowsExpanded: rowsExpanded,
          "rowsPerPage": 25,
          "elevation": 0,
          "textLabels": {
            body: {
              noMatch: "No embeddings found",
              toolTip: "Sort",
              columnHeaderTooltip: column => `Sort for ${column.label}`
            },
          },
          isRowExpandable: (dataIndex, expandedRows) => {
            // Prevent expand/collapse of any row if there are 4 rows expanded already (but allow those already expanded to be collapsed)
            //if (expandedRows.data.length > 1 )
            //  expandedRows.data = [];
            //handleViewClick(embeddings[dataIndex]);
            return true;
          },
          renderExpandableRow: (rowData, rowMeta) => {
            //handleViewClick(embeddings[rowMeta.dataIndex]);
            const colSpan = rowData.length + 1;
            return (
              <>
                <TableRow>
                  <TableCell sx={{ p: 2, backgroundColor: "#f0f0f0" }} colSpan={colSpan}><b>IDS:</b> <ReactJson src={embedding.ids} enableClipboard={false} collapsed={0} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ p: 2, backgroundColor: "#f0f0f0" }} colSpan={colSpan}><b>Metadatas:</b> <ReactJson src={embedding.metadatas} enableClipboard={false} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ p: 2, backgroundColor: "#f0f0f0" }} colSpan={colSpan}><b>Documents:</b> <ReactJson src={embedding.documents} enableClipboard={false} /></TableCell>
                </TableRow>
              </>);
          },
          onRowExpansionChange: (_, allRowsExpanded) => {
            setRowsExpanded(allRowsExpanded.slice(-1).map(item => item.index))
            if(allRowsExpanded.length > 0) {
              handleViewClick(embeddings[allRowsExpanded[0].dataIndex]);
            }
          }
        }}
        data={embeddings.map(embedding => [embedding])}
        columns={[{
          name: "Name",
          options: {
            customBodyRender: (value, tableMeta, updateValue) => (
              <Box display="flex" alignItems="center" gap={4}>
                {value}
              </Box>
            )
          }
        }]}
      />

    </Card>
  );
}

