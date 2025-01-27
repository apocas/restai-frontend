import { useState } from "react";
import {
  Box,
  Card,
  Table,
  styled,
  TableRow,
  useTheme,
  TableBody,
  TableCell,
  TableHead,
  Button,
  TablePagination
} from "@mui/material";
import { useNavigate } from "react-router-dom";


const CardHeader = styled(Box)(() => ({
  display: "flex",
  paddingLeft: "24px",
  paddingRight: "24px",
  marginBottom: "12px",
  alignItems: "center",
  justifyContent: "space-between"
}));

const Title = styled("span")(() => ({
  fontSize: "1rem",
  fontWeight: "500",
  textTransform: "capitalize"
}));

const ProductTable = styled(Table)(() => ({
  minWidth: 400,
  whiteSpace: "pre",
  "& small": {
    width: 50,
    height: 15,
    borderRadius: 500,
    boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)"
  },
  "& td": { borderBottom: "none" },
  "& td:first-of-type": { paddingLeft: "16px !important" }
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

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1)
}));


export default function EmbeddingsTable({ teams = [], title = "Teams" }) {
  const { palette } = useTheme();

  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Card elevation={3} sx={{ pt: "20px", mb: 3 }}>
      <CardHeader>
        <Title>{title}</Title>
      </CardHeader>

      <Box overflow="auto">
        <ProductTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ px: 3 }}>
                ID
              </TableCell>
              <TableCell sx={{ px: 3 }} colSpan={2}>
                Name
              </TableCell>

              <TableCell sx={{ px: 0 }} colSpan={2}>
                Description
              </TableCell>

              <TableCell sx={{ px: 0 }}>
                Members
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {teams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((team, index) => (
              <TableRow key={index} hover>
                <TableCell align="left" sx={{ px: 0, textTransform: "capitalize" }}>
                  {team.id}
                </TableCell>
                <TableCell align="left" sx={{ px: 0, textTransform: "capitalize" }} colSpan={2}>
                  <Box display="flex" alignItems="center" gap={4}>
                    <StyledButton onClick={() => { navigate("/team/" + team.id) }} color="primary">{team.name}</StyledButton>
                  </Box>
                </TableCell>

                <TableCell align="left" sx={{ px: 0, textTransform: "capitalize" }} colSpan={2}>
                  {team.description}
                </TableCell>

                <TableCell align="left" sx={{ px: 0, textTransform: "capitalize" }}>
                  {team.members.length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ProductTable>

        {teams && teams.length > 25 && (
          <TablePagination
            sx={{ px: 2 }}
            page={page}
            component="div"
            rowsPerPage={rowsPerPage}
            count={teams.length}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[25, 50, 100]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            nextIconButtonProps={{ "aria-label": "Next Page" }}
            backIconButtonProps={{ "aria-label": "Previous Page" }}
          />
        )}
      </Box >
    </Card >
  );
}
