import { Delete } from "@mui/icons-material";
import {
  Box,
  Card,
  Avatar,
  styled,
  useTheme,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import sha256 from 'crypto-js/sha256';
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import useAuth from "app/hooks/useAuth";
import { toast } from 'react-toastify';

const Small = styled("small")(({ bgcolor }) => ({
  width: 50,
  height: 15,
  color: "#fff",
  padding: "2px 8px",
  borderRadius: "4px",
  overflow: "hidden",
  background: bgcolor,
  boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)"
}));

const StyledAvatar = styled(Avatar)(() => ({
  width: "32px !important",
  height: "32px !important"
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1)
}));


export default function KeysTable({ keys = [], title = "API Keys" }) {
  const { palette } = useTheme();
  const bgError = palette.error.main;
  const bgPrimary = palette.primary.main;
  const bgSecondary = palette.secondary.main;
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const auth = useAuth();

  const navigate = useNavigate();


  const handleDeleteClick = (key_id) => {
    if (window.confirm("Are you sure you to the key" + key_id + "?")) {
      fetch(url + "/proxy/keys/" + key_id, {
        method: 'DELETE',
        headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth.user.token }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error deleting key');
          }
          window.location.reload();
        }).catch(err => {
          console.log(err.toString());
          toast.error("Error deleting key");
        });
    }
  };

  return (
    <Card elevation={3} sx={{ pt: "20px", mb: 3 }}>
      <MUIDataTable
        title={title}
        options={{
          "print": false,
          "selectableRows": "none",
          "download": false,
          "filter": true,
          "viewColumns": false,
          "rowsPerPage": 25,
          "elevation": 0,
          "textLabels": {
            body: {
              noMatch: "No keys found",
              toolTip: "Sort",
              columnHeaderTooltip: column => `Sort for ${column.label}`
            },
          }
        }}
        data={keys.map(key => [key.name, key.key, key.models, key.spend, key.max_budget, key.duration_budget, key.tpm, key.rpm, key.id])}
        columns={["Name", "Key",
          {
            name: "Models",
            options: {
              customBodyRender: (value, tableMeta, updateValue) => (
                <div  >
                  {value.map((model, index) => (
                    <Small
                      bgcolor={bgPrimary}
                      key={index}
                      sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      {model}
                    </Small>
                  ))}
                </div>
              )
            }
          },
          "Spend",
          "Budget",
          "Budget Duration",
          "TPM",
          "RPM",
          {
            name: "Actions",
            options: {
              customBodyRender: (value, tableMeta, updateValue) => (
                <div>
                  <Tooltip title="Delete" placement="top">
                    <IconButton onClick={() => handleDeleteClick(value)}>
                      <Delete color="primary" />
                    </IconButton>
                  </Tooltip>
                </div>
              )
            }
          }]}
      />
    </Card >
  );
}
