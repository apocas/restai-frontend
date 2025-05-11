import { useState } from "react";
import {
  Box,
  Card,
  styled,
  Button,
  Tooltip,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { Edit } from "@mui/icons-material";

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1)
}));

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

export default function LLMsTable({ llms = [], title = "LLMs" }) {
  const { palette } = useTheme();
  const bgError = palette.error.main;
  const bgPrimary = palette.primary.main;
  const bgSecondary = palette.secondary.main;
  const navigate = useNavigate();

  // Custom toolbar for the top right
  const CustomToolbar = () => (
    <Tooltip title="Create New LLM">
      <StyledButton
        variant="contained"
        color="primary"
        onClick={() => navigate("/llms/new")}
        sx={{ ml: 2 }}
      >
        New LLM
      </StyledButton>
    </Tooltip>
  );

  return (
    <Card elevation={3} sx={{ pt: "20px", mb: 3 }}>
      <MUIDataTable
        title={title}
        options={{
          print: false,
          selectableRows: "none",
          download: false,
          filter: true,
          viewColumns: false,
          rowsPerPage: 10,
          rowsPerPageOptions: [10, 15, 100],
          elevation: 0,
          textLabels: {
            body: {
              noMatch: "No LLMs found",
              toolTip: "Sort",
              columnHeaderTooltip: column => `Sort for ${column.label}`
            },
          },
          customToolbar: CustomToolbar
        }}
        data={llms.map(llm => [llm.name, llm.class_name, llm.privacy, llm.type, llm])}
        columns={[
          {
            name: "Name",
            options: {
              customBodyRender: (value, tableMeta) => (
                <StyledButton onClick={() => navigate("/llm/" + value)} color="primary">{value}</StyledButton>
              )
            }
          },
          {
            name: "Class",
            options: {}
          },
          {
            name: "Privacy",
            options: {
              customBodyRender: (value) => (
                value === "private" ? (
                  <Small bgcolor={palette.success.main}>{value}</Small>
                ) : (
                  <Small bgcolor={palette.error.main}>{value}</Small>
                )
              )
            }
          },
          {
            name: "Type",
            options: {
              customBodyRender: (value) => (
                value === "vision" ? (
                  <Small bgcolor={bgSecondary}>{value}</Small>
                ) : value === "qa" ? (
                  <Small bgcolor={bgPrimary}>{value}</Small>
                ) : value === "chat" ? (
                  <Small bgcolor={palette.success.light}>{value}</Small>
                ) : (
                  <Small bgcolor={bgError}>{value}</Small>
                )
              )
            }
          },
          {
            name: "Actions",
            options: {
              customBodyRender: (llm) => (
                <Box display="flex" alignItems="center" gap={1}>
                  <Tooltip title="Edit">
                    <StyledButton onClick={() => navigate("/llm/" + llm.name + "/edit")} color="secondary" variant="outlined" sx={{ minWidth: 0, p: 1 }}>
                      <Edit fontSize="small" />
                    </StyledButton>
                  </Tooltip>
                </Box>
              )
            }
          }
        ]}
      />
    </Card>
  );
}
