import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CancelIcon from "@mui/icons-material/Cancel";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./App.css";
import Slide from "@mui/material/Slide";


import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

var faro = initializeFaro({
  url: process.env.REACT_APP_FARO_COLLECTOR_URL,
  app: {
    name: process.env.REACT_APP_FARO_COLLECTOR_NAME,
    version: "1.0.0",
    environment: process.env.REACT_APP_FARO_COLLECTOR_ENVIRONMENT,
  },

  instrumentations: [
    // Mandatory, overwriting the instrumentations array would cause the default instrumentations to be omitted
    ...getWebInstrumentations(),

    // Initialization of the tracing package.
    // This packages is optional because it increases the bundle size noticeably. Only add it if you want tracing data.
    new TracingInstrumentation(),
  ],
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

var server = process.env.REACT_APP_API_URL || "http://localhost:8080";

function App() {
  const [votes, setVotes] = useState(0);
  const [votesDetails, setVotesDetails] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    getVotes();
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetch(`${server}/count_votes`)
      .then((res) => res.json())
      .then((res) => {
        console.log("Response: " + res);
        setVotes(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [setVotes]);

  function addVote() {
    fetch(`${server}/add_vote`)
      .then((res) => res.json())
      .then((res) => {
        console.log("Response: " + res);
        setVotes(votes + 1);
        faro.api.pushEvent('user clicked add vote button');
      })
      .catch((error) => {
        console.log(error);
        alert(error);
        const customError = new Error(`error adding vote: ${error}`);
        faro.api.pushError(customError);
      });
  }

  function getVotes() {
    fetch(`${server}/get_votes`)
      .then((res) => res.json())
      .then((res) => {
        console.log("Response: " + res);
        setVotesDetails(res);
        faro.api.pushEvent('votes loaded successfully');
      })
      .catch((error) => {
        console.log(error);
        const customError = new Error(`error loading votes: ${error}`);
        faro.api.pushError(customError);
      });
  }

  function clearVotes() {
    fetch(`${server}/clear_votes`)
      .then((res) => res.json())
      .then((res) => {
        console.log("Response: " + res);
        setVotes(0);
        faro.api.pushEvent('user clicked clear votes button');
      })
      .catch((error) => {
        console.log(error);
        alert(error);
        const customError = new Error(`error loading votes: ${error}`);
        faro.api.pushError(customError);
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Voting Web App</h1>
        <img src={logo} className="App-logo" alt="logo" width={250} />
        <Stack
          direction={"row"}
          spacing={2}
          alignContent={"center"}
          alignItems={"center"}
        >
          <IconButton color="inherit" onClick={addVote}>
            <ThumbUpIcon style={{ fontSize: "50" }} />
          </IconButton>
          <IconButton color="inherit" onClick={handleClickOpen}>
            <ListAltIcon style={{ fontSize: "50" }} />
          </IconButton>
          <IconButton color="inherit" onClick={clearVotes}>
            <CancelIcon style={{ fontSize: "50" }} />
          </IconButton>
        </Stack>
        <h1>{votes}</h1>
        <Dialog
          fullScreen
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
        >
          <AppBar sx={{ position: "relative" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Votes
              </Typography>
              <Button autoFocus color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Time</TableCell>
                  <TableCell align="center">Vote</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votesDetails !== null &&
                  Object.values(votesDetails).map((row) => (
                    <TableRow
                      key={row.Id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell align="center">{row.Time}</TableCell>
                      <TableCell align="center">{row.Count}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Dialog>
      </header>
    </div>
  );
}

export default App;
