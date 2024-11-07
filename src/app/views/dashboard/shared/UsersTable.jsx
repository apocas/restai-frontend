import { useState } from "react";
import {
  Box,
  Card,
  Table,
  Avatar,
  styled,
  TableRow,
  useTheme,
  TableBody,
  TableCell,
  TableHead,
  Button,
  TablePagination
} from "@mui/material";
import sha256 from 'crypto-js/sha256';
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

const StyledAvatar = styled(Avatar)(() => ({
  width: "32px !important",
  height: "32px !important"
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1)
}));


export default function ProjectsTable({ users = [], title = "Users" }) {
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
              <TableCell>
              </TableCell>
              <TableCell sx={{ px: 3 }} colSpan={2}>
                Username
              </TableCell>

              <TableCell sx={{ px: 0 }}>
                Auth
              </TableCell>

              <TableCell sx={{ px: 0 }}>
                Permissions
              </TableCell>

              <TableCell sx={{ px: 0 }} colSpan={2}>
                Projects
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <StyledAvatar src={`https://www.gravatar.com/avatar/${sha256(user.username).toString()}`} />
                </TableCell>

                <TableCell align="left" sx={{ px: 0, textTransform: "capitalize" }} colSpan={2}>
                  <Box display="flex" alignItems="center" gap={4}>
                    <StyledButton onClick={() => { navigate("/user/" + user.username) }} color="primary">{user.username}</StyledButton>
                  </Box>
                </TableCell>

                <TableCell align="left" sx={{ px: 0, textTransform: "capitalize" }}>
                  {user.sso ? (
                    <Small bgcolor={palette.success.main}>{"SSO"}</Small>
                  ) : (
                    <Small bgcolor={palette.error.main}>{"Local"}</Small>
                  )}
                </TableCell>

                <TableCell align="left" sx={{ px: 0, textTransform: "capitalize" }}>
                  {user.is_admin ? (
                    <Small bgcolor={palette.error.main}>{"Admin"}</Small>
                  ) : (
                    <Small bgcolor={palette.primary.main}>{"User"}</Small>
                  )}
                </TableCell>

                <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: "capitalize" }}>
                  {user.projects.length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ProductTable>

        {users && users.length > 25 && (
          <TablePagination
            sx={{ px: 2 }}
            page={page}
            component="div"
            rowsPerPage={rowsPerPage}
            count={users.length}
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
