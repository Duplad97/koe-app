import React from 'react';
import { withSnackbar } from 'notistack';
import { withRouter } from 'react-router';
import { Container, Fab, Paper, Tooltip, MenuList, MenuItem, Grid, Backdrop, CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PublicIcon from '@material-ui/icons/Public';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import OwnNotes from './OwnNotes';
import BrowseNotes from './BrowseNotes';
import { NewNoteDialog } from './NoteFormDialog';
import { getAllNotes, getOwnNotes } from '../../requests/notes';
import { getProfile } from '../../requests/users';

import "./Notes.scss";

class Notes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 0,
            browseNotes: [],
            filterBrowseNotes: [],
            ownNotes: [],
            filterOwnNotes: [],
            loading: true,
            dialogOpen: false,
            active: false,
            iAm: null,
        }
    }

    componentDidMount() {
        this.getNotes();
    }

    render() {
        return (
            <Container>
                {!this.state.loading ?
                    <React.Fragment>
                        <Paper elevation={4} style={{ padding: 25 }}>
                            <Grid container>
                                <Grid item xs={12} sm={3}>
                                    <Paper>
                                        <MenuList>
                                            <MenuItem onClick={() => this.handleChange(0)} selected={this.state.value === 0}><PublicIcon className="menuIcon" />Böngészés</MenuItem>
                                            {this.state.active ?
                                                // Ha a felhasználó fiókja nem aktív, akkor a saját jegyzetekhez nem fér hozzá
                                                <MenuItem onClick={() => this.handleChange(1)} selected={this.state.value === 1}><AccountCircleIcon className="menuIcon" />Saját</MenuItem>
                                                : null
                                            }
                                        </MenuList>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={9}>

                                    <BrowseNotes value={this.state.value} index={0} notes={this.state.filterBrowseNotes} onSearch={this.onSearch} iAm={this.state.iAm} active={this.state.active} enqueueSnackbar={this.props.enqueueSnackbar} getNotes={this.getNotes} />

                                    {this.state.active ?
                                        <OwnNotes value={this.state.value} index={1} notes={this.state.filterOwnNotes} getNotes={this.getNotes} onSearch={this.onSearch} enqueueSnackbar={this.props.enqueueSnackbar} />
                                        :
                                        null
                                    }

                                </Grid>
                            </Grid>
                        </Paper>

                        {this.state.active ?
                            // Ha a felhasználó nem aktv, akkor nem hozhat létre új jegyzetet
                            <Tooltip title="Új jegyzet">
                                <Fab onClick={this.handleDialog} className="fab" color="primary"><AddIcon /></Fab>
                            </Tooltip>
                            : null}

                        <NewNoteDialog open={this.state.dialogOpen} handleClose={this.handleDialogClose} getNotes={this.getNotes} enqueueSnackbar={this.props.enqueueSnackbar} />

                    </React.Fragment>
                    : <Backdrop open={true}>
                        <CircularProgress />
                    </Backdrop>
                }
            </Container>
        )
    }

    // Jegyzet létrehozás ablak megnyitása
    handleDialog = () => {
        this.setState({ dialogOpen: true });
    }

    // Jegyzet létrehozás ablak bezárása
    handleDialogClose = () => {
        this.setState({ dialogOpen: false });
    }

    // Keresés a paraméterben kapott kategória alapján
    onSearch = (category, term) => {
        let result = [];
        if (category === "noteName") {
            this.state.browseNotes.forEach(data => {
                if (data.note.name.toLowerCase().includes(term.toLowerCase())) {
                    result.push(data);
                }
            });
            this.setState({ filterBrowseNotes: result });
        }
        if (category === "userName") {
            this.state.browseNotes.forEach(data => {
                const name = `${data.note.user.lastName} ${data.note.user.firstName}`;
                if (name.toLowerCase().includes(term.toLowerCase())) {
                    result.push(data);
                }
            });
            this.setState({ filterBrowseNotes: result });
        }
        if (category === "fileName") {
            this.state.browseNotes.forEach(data => {
                const path = data.note.path.split("/");
                const file = path[path.length - 1];
                if (file.toLowerCase().includes(term.toLowerCase())) {
                    result.push(data);
                }
            });
            this.setState({ filterBrowseNotes: result });
        }
        if (category === "category") {
            this.state.browseNotes.forEach(data => {
                if (data.note.category.toLowerCase().includes(term.toLowerCase())) {
                    result.push(data);
                }
            });
            this.setState({ filterBrowseNotes: result });
        }
        if (category === "reset") {
            this.setState({ filterBrowseNotes: this.state.browseNotes, filterOwnNotes: this.state.ownNotes });
            return;
        }
        if (category === "own") {
            // Saját jegyzeteknél csak név szerint kereshetünk
            this.state.ownNotes.forEach(data => {
                if (data.note.name.toLowerCase().includes(term.toLowerCase())) {
                    result.push(data);
                }
            });
            this.setState({ filterOwnNotes: result });
        }
    }

    handleChange = i => {
        this.setState({ value: i });
    }

    getNotes = () => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        getAllNotes(token).then(response => {
            if (response.status === 200) {
                const notes = response.data.result;
                const active = response.data.active;
                notes.sort((a, b) => a.note.createdAt < b.note.createdAt && 1 || -1);
                this.setState({ browseNotes: notes, filterBrowseNotes: notes, active: active });
            }
        }).catch(error => { });

        getOwnNotes(token).then(response => {
            if (response.status === 200) {
                const notes = response.data;
                notes.sort((a, b) => a.note.createdAt < b.note.createdAt && 1 || -1);
                this.setState({ ownNotes: notes, filterOwnNotes: notes });
            }
        }).catch(error => { this.setState({ loading: false }) });

        getProfile(token, "own").then(response => {
            if (response.status === 200) {
                this.setState({ iAm: response.data.user });
                this.setState({ loading: false });
            }
        }).catch(() => { });
    }
}

const WithSnackbarNotes = withSnackbar(Notes);
export default withRouter(WithSnackbarNotes);