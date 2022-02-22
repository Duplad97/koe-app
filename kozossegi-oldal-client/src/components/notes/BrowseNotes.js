import React, { useState } from 'react';
import { Container, Grid, FormControl, Select, MenuItem, Button, AccordionActions, TextField, InputAdornment, Grow, Avatar, IconButton, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { BASE_URL } from '../../config/api.config';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import FilterListIcon from '@material-ui/icons/FilterList';
import { saveAs } from "file-saver";
import { useHistory } from 'react-router';
import { deleteNote } from '../../requests/notes';

export default function BrowseNotes(props) {
    const [term, setTerm] = useState("");
    const [searchCategory, setSearchCategory] = useState("noteName");
    const [filterOpen, setFilterOpen] = useState(false);

    // A kereső konténer lenyitása
    const onFilter = () => {
        setFilterOpen(!filterOpen);
    }

    const onChange = event => {
        setSearchCategory(event.target.value);
    }

    // Keresés enter nyomásra
    const onKeyUp = e => {
        if (e.key === 'Enter') {
            props.onSearch(searchCategory, e.target.value)
        }
    }

    const onTermChange = e => {
        setTerm(e.target.value);
        // Ha a kereső mező tartalmát töröljük, akkor üres string-re
        // keresünk (visszaállítjuk az eredeti listát)
        if (e.target.value === "") {
            props.onSearch(searchCategory, "");
        }
    }

    const onSearch = () => {
        props.onSearch(searchCategory, term);
    }

    const onDeleteTerm = () => {
        setTerm("");
        props.onSearch("reset", "");
    }

    return (
        <div hidden={props.value !== props.index}>
            <Container>
                <div style={{ textAlign: 'right' }}>
                    <Button onClick={onFilter} style={{ marginBottom: 20 }} startIcon={<FilterListIcon />}>Szűrés</Button>
                </div>

                <Grow in={filterOpen} style={filterOpen ? { display: 'block' } : { display: 'none' }}>
                    <div style={{ textAlign: 'right' }}>
                        <FormControl>
                            <Select onChange={onChange} value={searchCategory}>
                                <MenuItem value="noteName">Jegyzet neve</MenuItem>
                                <MenuItem value="userName">Feltöltő neve</MenuItem>
                                <MenuItem value="fileName">Fájl neve</MenuItem>
                                <MenuItem value="category">Kategória</MenuItem>
                            </Select>
                        </FormControl>

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
                    </div>
                </Grow>

                {props.notes.length > 0 ?
                    <div>
                        {props.notes.map(data => {
                            return <NoteAccordion getNotes={props.getNotes} enqueueSnackbar={props.enqueueSnackbar} data={data} active={props.active} iAm={props.iAm} />
                        })}</div>
                    :
                    <Typography style={{ textAlign: 'center' }} variant="h6">Nincs találat...</Typography>
                }
            </Container>
        </div>
    )
}

// Jegyzet lenyiló listaelem
function NoteAccordion(props) {
    const history = useHistory();
    const note = props.data.note;
    const user = note.user;
    const shortName = user.lastName[0] + user.firstName[0];
    const avatar = user.avatar ? BASE_URL + user.avatar : "";
    const date = new Date(note.createdAt).toLocaleDateString();
    const path = note.path.split("/");
    const file = path[path.length - 1];

    const saveFile = () => {
        saveAs(BASE_URL + note.path, file);
    }

    const onWatchNote = () => {
        history.replace(`/note/${note.id}`);
    }

    const onDeleteNote = () => {
        const token = localStorage.getItem("accessToken");
        deleteNote(token, note.id).then(response => {
            if (response.status === 200) {
                props.getNotes();
                props.enqueueSnackbar("Jegyzet törölve!", { variant: "success" });
            }
        }).catch(error => { console.log(error.response) });
    }

    return (
        <Accordion>

            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <div className="accordionHeader">
                    <div className="accordionHeader_container">
                        <Avatar className={user.gender !== "female" ? "accordionHeader_avatar" : "accordionHeader_avatar_female"} src={avatar}>{shortName}</Avatar>
                        <Typography className="accordionHeader_name">{`${user.lastName} ${user.firstName}`}</Typography>
                    </div>
                    <Typography className="accordionHeader_title" color="textSecondary">{note.name}</Typography>
                    <Typography className="accordionHeader_title" color="textSecondary">Feltöltve: {date}</Typography>
                </div>
            </AccordionSummary>

            <AccordionDetails>
                <DetailsGrid note={note} likers={props.data.likers} comments={props.data.comments} />
            </AccordionDetails>

            <AccordionActions>
                <Button size="small" variant="text" onClick={onWatchNote}>Megnézem</Button>
                <Button disabled={!props.active} size="small" variant="text" onClick={saveFile}>Letöltés</Button>
                {props.iAm.role === "admin" ? <Button size="small" onClick={onDeleteNote} variant="text">Törlés</Button> : ""}
            </AccordionActions>

        </Accordion>
    )
}

// Jegyzet adatok
function DetailsGrid(props) {
    const note = props.note;
    const path = note.path.split("/");
    const file = path[path.length - 1];
    return (
        <Grid container>
            <Grid item xs={12} sm={6}>

                <Typography variant="body1" >Kategória: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{note.category}</Typography></Typography>

                <Typography variant="body1" >Fájl: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{file}</Typography></Typography>

            </Grid>
            <Grid item xs={12} sm={6}>

                <Typography variant="body1" >Kommentek: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{props.comments.length}</Typography></Typography>

                <Typography variant="body1" >Kedvelések: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{props.likers.length}</Typography></Typography>
            </Grid>
        </Grid>
    )
}