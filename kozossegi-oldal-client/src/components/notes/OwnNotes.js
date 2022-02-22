import React, { useState } from 'react';
import { Container, Button, TextField, InputAdornment, ListItemText, ListItemSecondaryAction, List, ListItem, Divider, Tooltip, IconButton, Typography, DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import CreateIcon from '@material-ui/icons/Create';
import { deleteNote } from '../../requests/notes';
import { UpdateNoteDialog } from './NoteFormDialog';
import { useHistory } from 'react-router';

export default function OwnNotes(props) {
    const [term, setTerm] = useState("");

    const onKeyUp = e => {
        if (e.key === 'Enter') {
            props.onSearch("own", e.target.value)
        }
    }

    const onTermChange = e => {
        setTerm(e.target.value);
        if (e.target.value === "") {
            props.onSearch("own", "");
        }
    }

    const onSearch = () => {
        props.onSearch("own", term);
    }

    const onDeleteTerm = () => {
        setTerm("");
        props.onSearch("reset", "");
    }

    return (
        <div hidden={props.value !== props.index}>
            <Container>
                <TextField
                    onChange={onTermChange}
                    onKeyUp={onKeyUp}
                    value={term}
                    style={{ marginBottom: 20 }}
                    variant="outlined"
                    label="Keresés"
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                {term !== "" ?
                                    <IconButton onClick={onDeleteTerm}>
                                        <CloseIcon />
                                    </IconButton>
                                    : ""
                                }
                                <IconButton onClick={onSearch}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                {props.notes.length > 0 ?
                    <List>
                        {props.notes.map(data => {
                            return <NoteListItem data={data} getNotes={props.getNotes} enqueueSnackbar={props.enqueueSnackbar} />
                        })}</List>
                    :
                    <Typography style={{ textAlign: 'center' }} variant="h6">Nincs találat...</Typography>
                }

            </Container>
        </div>
    )
}

function NoteListItem(props) {
    const history = useHistory();
    const [openDialog, setOpenDialog] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

    const note = props.data.note;
    const path = note.path.split("/");
    const file = path[path.length - 1];

    // Törlés ablak megnyitás
    const handleDialog = () => { setOpenDialog(true) }

    // Törlés ablak bezárás
    const handleClose = () => { setOpenDialog(false) }

    // Szerkesztő ablak megnyitás
    const handleUpdateDialog = () => { setUpdateOpen(true) }

    // Szerkesztő ablak bezárás
    const handleUpdateClose = () => { setUpdateOpen(false) }

    const onWatchNote = () => {
        history.replace(`/note/${note.id}`);
    }

    return (
        <div>
            <ListItem button onClick={onWatchNote}>
                <ListItemText primary={note.name} />
                <ListItemText primary={file} />
                <ListItemSecondaryAction>

                    <Tooltip title="Szerkesztés">
                        <IconButton onClick={handleUpdateDialog}>
                            <CreateIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Törlés">
                        <IconButton onClick={handleDialog}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>

                </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <NoteDeleteDialog open={openDialog} text={<span>Biztosan törölni szeretnéd a(z) <b>{note.name}</b> jegyzetet?</span>} id={note.id} handleClose={handleClose} getNotes={props.getNotes} enqueueSnackbar={props.enqueueSnackbar} />

            <UpdateNoteDialog open={updateOpen} note={note} handleClose={handleUpdateClose} getNotes={props.getNotes} enqueueSnackbar={props.enqueueSnackbar} />
        </div>
    )
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Jegyzet törlés figyelmeztető/megerősítő ablak
function NoteDeleteDialog(props) {

    const onDelete = () => {
        const token = localStorage.getItem("accessToken");
        deleteNote(token, props.id).then(response => {
            if (response.status === 200) {
                props.handleClose();
                props.getNotes();
                props.enqueueSnackbar("Jegyzet törölve!", { variant: 'success' });
            }
        }).catch(error => {
            props.handleClose();
            props.getNotes();
            props.enqueueSnackbar("Jegyzet törlés sikertelen!", { variant: 'error' });
        })
    }

    return (
        <Dialog
            open={props.open}
            TransitionComponent={Transition}
            keepMounted
            onClose={props.handleClose}
        >
            <DialogTitle >{"Figyelmeztetés!"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {props.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    Mégsem
                </Button>
                <Button color="primary" onClick={onDelete}>
                    Igen
                </Button>
            </DialogActions>
        </Dialog>
    );
}