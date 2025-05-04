import React from "react";
import {
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Tooltip,
  Chip,
  Button,
  Box
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import useAuth from "app/hooks/useAuth";

export default function TeamTable({ teams, onView, onEdit, onDelete, isAdmin }) {
  const { user } = useAuth();
  
  if (!teams || teams.length === 0) {
    return (
      <Card elevation={3}>
        <Box p={3} textAlign="center">
          <Typography variant="body1" color="textSecondary">
            No teams found. {isAdmin && "Click 'New Team' to create one."}
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <Table style={{ tableLayout: "fixed", minWidth: 750 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Users</TableCell>
            <TableCell>Projects</TableCell>
            <TableCell>Your Role</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <Typography variant="subtitle1">{team.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {team.description || "No description"}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{team.users?.length || 0}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{team.projects?.length || 0}</Typography>
              </TableCell>
              <TableCell>
                {isAdmin ? (
                  <Chip label="Platform Admin" color="primary" variant="outlined" size="small" />
                ) : team.admins?.some(admin => admin.id === user?.id) ? (
                  <Chip label="Team Admin" color="secondary" variant="outlined" size="small" />
                ) : (
                  <Chip label="Member" color="default" variant="outlined" size="small" />
                )}
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View Team">
                  <IconButton onClick={() => onView(team.id)}>
                    <Visibility color="primary" />
                  </IconButton>
                </Tooltip>
                {(isAdmin || team.admins?.some(admin => admin.id === user?.id)) && (
                  <Tooltip title="Edit Team">
                    <IconButton onClick={() => onEdit(team.id)}>
                      <Edit color="secondary" />
                    </IconButton>
                  </Tooltip>
                )}
                {isAdmin && (
                  <Tooltip title="Delete Team">
                    <IconButton onClick={() => onDelete(team.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}