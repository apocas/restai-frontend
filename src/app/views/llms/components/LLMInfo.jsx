import {
  Card,
  Table,
  styled,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  Button
} from "@mui/material";

import { H4, Small } from "app/components/Typography";
import { FlexBetween, FlexBox } from "app/components/FlexBox";
import QRCode from "react-qr-code";
import { Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ReactJson from '@microlink/react-json-view';

const ContentBox = styled(FlexBox)({
  alignItems: "center",
  flexDirection: "column"
});

export default function LLMInfo({ llm, projects }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ pt: 3 }} elevation={3}>
      <ContentBox mb={3} alignContent="center">
        <QRCode
          size={256}
          style={{ width: 84, height: 84 }}
          value={window.location.href || "RESTai"}
          viewBox={`0 0 256 256`}
        />

        <H4 sx={{ mt: "16px", mb: "8px" }}>{llm.name}</H4>
        <Small color="text.secondary">{llm.description}</Small>
      </ContentBox>

      <Divider />

      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ pl: 2 }}>Class</TableCell>
            <TableCell colSpan={4}>{llm.class_name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ pl: 2 }}>Type</TableCell>
            <TableCell colSpan={4}>{llm.type}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ pl: 2 }}>Privacy</TableCell>
            <TableCell colSpan={4}>{llm.privacy}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ pl: 2 }}>Options</TableCell>
            <TableCell colSpan={4}>{llm.options && (<ReactJson src={JSON.parse(llm.options)} enableClipboard={true} name={false}/>)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ pl: 2 }}>Description</TableCell>
            <TableCell colSpan={4}>{llm.description}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <FlexBetween p={2}>
        <Button variant="outlined" onClick={() => { navigate("/llm/" + llm.name + "/edit") }} startIcon={<Edit fontSize="small" />}>
          Edit
        </Button>
      </FlexBetween>
    </Card>
  );
}