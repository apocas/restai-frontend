import { SmartToy } from "@mui/icons-material";
import {
  Card,
  Table,
  styled,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  Box,
  Autocomplete,
  TextField
} from "@mui/material";
import { useState, useEffect } from "react";
import { H4 } from "app/components/Typography";
import useAuth from "app/hooks/useAuth";
import { toast } from 'react-toastify';

const FlexBox = styled(Box)({
  display: "flex",
  alignItems: "center"
});


export default function ProjectAgent({ project, projects }) {
  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const auth = useAuth();
  const [tools, setTools] = useState([]);

  const fetchTools = () => {
    return fetch(url + "/tools/agent", { headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }) })
      .then((res) => res.json())
      .then((d) => {
        setTools(d)
      }).catch(err => {
        console.log(err.toString());
        toast.error("Error fetching Tools");
      });
  }

  useEffect(() => {
    fetchTools();
  }, []);

  return (
    <Card elevation={3}>
      <FlexBox>
        <SmartToy sx={{ ml: 2 }} />
        <H4 sx={{ p: 2 }}>
          Agent
        </H4>
      </FlexBox>
      <Divider />

      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ pl: 2 }}>Tools</TableCell>
            <TableCell>
              <Autocomplete
                multiple
                disabled
                id="tags-standard"
                options={(project.tools || "").split(",")}
                getOptionLabel={(option) => option}
                defaultValue={(project.tools || "").split(",")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="standard"
                    label=""
                    placeholder=""
                  />
                )}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
