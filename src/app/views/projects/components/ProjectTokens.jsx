import {
  Card,
  styled,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useAuth from "app/hooks/useAuth";
import { toast } from 'react-toastify';
import { H4 } from "app/components/Typography";
import { useState, useEffect, useMemo } from "react";
import DataUsageIcon from '@mui/icons-material/DataUsage';

const FlexBox = styled(Box)({
  display: "flex",
  alignItems: "center"
});

export default function ProjectTokens({ project }) {
  const [tokens, setTokens] = useState({ "version": "", "embeddings": [], "llms": [], "loaders": [] });
  const auth = useAuth();
  const url = process.env.REACT_APP_RESTAI_API_URL || "";

  const fetchTokens = () => {
    return fetch(url + "/projects/" + project.name + "/tokens/daily", { headers: new Headers({ 'Authorization': 'Basic ' + auth.user.token }) })
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
      .then((d) => setTokens(d)
      ).catch(err => {
        toast.error(err.toString());
      });
  }

  useEffect(() => {
    if (project.name) {
      fetchTokens();
    }
  }, [project]);

  const filledTokens = useMemo(() => {
    if (!tokens || !tokens.tokens || tokens.tokens.length === 0) return [];
    const sampleDate = new Date(tokens.tokens[0].date);
    const year = sampleDate.getFullYear();
    const month = sampleDate.getMonth(); // 0-indexed month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Map existing tokens by date for quick lookup
    const tokenMap = {};
    tokens.tokens.forEach((item) => {
      tokenMap[item.date] = item;
    });
    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      result.push(tokenMap[dateStr] || { date: dateStr, input_tokens: 0, output_tokens: 0, input_cost: 0, output_cost: 0 });
    }
    return result;
  }, [tokens]);

  const sums = useMemo(() => {
    return filledTokens.reduce(
      (acc, item) => {
        acc.input_tokens += item.input_tokens || 0;
        acc.output_tokens += item.output_tokens || 0;
        acc.input_cost += item.input_cost || 0;
        acc.output_cost += item.output_cost || 0;
        return acc;
      },
      { input_tokens: 0, output_tokens: 0, input_cost: 0, output_cost: 0 }
    );
  }, [filledTokens]);

  return (
    <Card elevation={3}>
      <FlexBox>
        <DataUsageIcon sx={{ ml: 2 }} />
        <H4 sx={{ p: 2 }}>
          Usage
        </H4>
      </FlexBox>
      <Divider />

      <ResponsiveContainer width='100%' height={300}>
        <LineChart
          data={filledTokens}
          margin={{
            top: 30,
            right: 50,
            left: 20,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" unit=" tok" />
          <YAxis yAxisId="right" orientation="right" unit="€" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="input_tokens" stroke="#8884d8" activeDot={{ r: 8 }} name="Input Tokens" unit=" tokens" />
          <Line yAxisId="left" type="monotone" dataKey="output_tokens" stroke="#82ca9d" name="Output Tokens" unit=" tokens" />
          <Line yAxisId="right" type="monotone" dataKey="input_cost" stroke="#8884d8" activeDot={{ r: 8 }} name="Input Cost" unit="€" />
          <Line yAxisId="right" type="monotone" dataKey="output_cost" stroke="#82ca9d" name="Output Cost" unit="€" />
        </LineChart>
      </ResponsiveContainer>

      <Divider />

      {tokens && tokens.tokens && tokens.tokens.length > 0 &&
        <Box p={2}>
          <Typography variant="h6">Summary for {new Date(tokens.tokens[0].date).toLocaleString('default', { month: 'long' })}</Typography>
          <Typography>Input Tokens: {sums.input_tokens}</Typography>
          <Typography>Output Tokens: {sums.output_tokens}</Typography>
          <Typography>Input Cost: {sums.input_cost}€</Typography>
          <Typography>Output Cost: {sums.output_cost}€</Typography>
        </Box>
      }

    </Card>
  );
}
