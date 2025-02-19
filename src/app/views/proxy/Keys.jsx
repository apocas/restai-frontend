import { useState, useEffect } from "react";
import {
  Grid, styled, Box, Card, Divider, TableRow,
  TableBody,
  TableCell,
  Table,
  useTheme
} from "@mui/material";
import KeysTable from "./components/KeysTable";
import useAuth from "app/hooks/useAuth";
import Breadcrumb from "app/components/Breadcrumb";
import { toast } from 'react-toastify';

import { Route } from "@mui/icons-material";

import { H4 } from "app/components/Typography";

const FlexBox = styled(Box)({
  display: "flex",
  alignItems: "center"
});

const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const Container = styled("div")(({ theme }) => ({
  margin: 10,
  [theme.breakpoints.down("sm")]: { margin: 16 },
  "& .breadcrumb": { marginBottom: 30, [theme.breakpoints.down("sm")]: { marginBottom: 16 } }
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

export default function Keys() {
  const { palette } = useTheme();
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [keys, setKeys] = useState([]);
  const [info, setInfo] = useState({ "models": [], "url": "" });
  const auth = useAuth();
  const bgPrimary = palette.primary.main;

  const fetchKeys = () => {
    return auth.checkAuth().then(fetch(url + "/proxy/keys", { headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }) })
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
        setKeys(d.keys)
      }
      ).catch(err => {
        toast.error(err.toString());
      }));
  }

  const fetchInfo = () => {
    return fetch(url + "/proxy/info", { headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }) })
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
      .then((d) => setInfo(d)
      ).catch(err => {
        toast.error(err.toString());
      });
  }

  useEffect(() => {
    document.title = (process.env.REACT_APP_RESTAI_NAME || "RESTai") + ' - Projects';
    fetchKeys();
    fetchInfo();
  }, []);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Proxy", path: "/keys" }, { name: "Keys", path: "/keys" }]} />
      </Box>

      <ContentBox className="analytics">
        <Grid container spacing={3}>
          <Grid item lg={12} md={8} sm={12} xs={12}>
            <KeysTable keys={keys} info={info} />
          </Grid>
        </Grid>
        <Grid item lg={8} md={6} xs={12}>
          <Card elevation={3}>
            <FlexBox>
              <Route sx={{ ml: 2 }} />
              <H4 sx={{ p: 2 }}>
                Proxy Info
              </H4>
            </FlexBox>
            <Divider />

            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ pl: 2 }}>URL</TableCell>
                  <TableCell colSpan={4}>{info.url}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 2 }}>Models</TableCell>
                  <TableCell colSpan={4}>{info.models.map((model, index) => (
                    <Small
                      bgcolor={bgPrimary}
                      key={index}
                      sx={{
                        whiteSpace: 'nowrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {model}
                    </Small>
                  ))}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </ContentBox>
    </Container>
  );
}
