import { Dialog, DialogActions, DialogTitle, Button, DialogContent, FormControl, FormHelperText, FormLabel, TextField, Grid, FormControlLabel, RadioGroup, Radio } from '@material-ui/core';
import React, { useState } from 'react';
import { updateNote, uploadNote } from '../../requests/notes';

export function NewNoteDialog(props) {
    const [fileError, setFileError] = useState(false);
    const [fileMsg, setFileMsg] = useState("");
    const [file, setFile] = useState(null);

    const [name, setName] = useState("");
    const [nameError, setNameError] = useState(false);
    const [nameMsg, setNameMsg] = useState("");

    const [category, setCategory] = useState("");
    const [catError, setCatError] = useState(false);
    const [catMsg, setCatMsg] = useState("");

    const [description, setDescription] = useState("");
    const [descError, setDescError] = useState(false);
    const [descMsg, setDescMsg] = useState("");

    const [visibility, setVisibility] = useState("public");

    // Jegyzet mentése
    const onSaveNote = () => {
        const _name = name.trim();
        const _category = category.trim();
        const _description = description.trim();
        const _visibility = visibility.trim();

        if (_name !== "" && _category !== "" && file) {
            const token = localStorage.getItem("accessToken");
            const data = new FormData();
            data.append("file", file);
            data.append("name", _name);
            data.append("category", _category);
            data.append("description", _description);
            data.append("visibility", _visibility);
            uploadNote(token, data).then(response => {
                if (response.status === 200) {
                    handleClose();
                    props.getNotes();
                    props.enqueueSnackbar("Jegyzet létrehozva!", { variant: 'success' });
                }
            }).catch(error => {
                const message = error.response.data.message;
                if (message && message === "Name already in use!") {
                    props.enqueueSnackbar("Ez a név már foglalt!", {variant: "error"});
                } else {
                    handleClose();
                    props.getNotes();
                    props.enqueueSnackbar("Nem sikerült a jegyzetet létrehozni!", { variant: 'error' });
                }
            })
        }
        else {
            if (!file) {
                setFileError(true);
                setFileMsg("Nem választottál fájt!");
            }
            if (name === "") {
                setNameError(true);
                setNameMsg("Nem adtál meg nevet!");
            }
            if (category === "") {
                setCatError(true);
                setCatMsg("Nem adtál meg kategóriát!");
            }
        }
    }

    const handleClose = () => {
        // Az ablak bezárásakor visszaállítjuk az állapotát az alapra
        props.handleClose();
        setFile(null);
        setFileError(false);
        setFileMsg("");

        setName("");
        setNameError(false);
        setNameMsg("");

        setCategory("");
        setCatError(false);
        setCatMsg("");

        setDescription("");
        setDescError(false);
        setDescMsg("");

        setVisibility("public");
    }

    const handleChange = event => {
        const name = event.target.name;
        if (name === "file") {
            const _file = event.target.files[0];
            setFile(_file);
            setFileError(false);
            setFileMsg("");
        }
        if (name === "name") {
            setName(event.target.value);
            setNameError(false);
            setNameMsg("");
        }

        if (name === "category") {
            setCategory(event.target.value);
            setCatError(false);
            setCatMsg("");
        }

        if (name === "description") {
            setDescription(event.target.value);
            setDescError(false);
            setDescMsg("");
        }

        if (name === "visibility") {
            setVisibility(event.target.value);
        }
    }

    return (
        <Dialog open={props.open}>
            <DialogTitle>Új jegyzet</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <TextField name="name" onChange={handleChange} error={nameError} helperText={nameMsg} required variant="outlined" fullWidth label="Név" />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField name="category" onChange={handleChange} error={catError} helperText={catMsg} required variant="outlined" fullWidth label="Kategória" />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField name="description" onChange={handleChange} error={descError} helperText={descMsg} multiline rows={3} variant="outlined" fullWidth label="Leírás (opcionális)" />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl required component="fieldset">
                            <FormLabel component="legend">Láthatóság</FormLabel>
                            <RadioGroup style={{ textAlign: 'center' }} fullWidth row aria-label="visibility" name="visibility" value={visibility} onChange={handleChange}>
                                <FormControlLabel value="public" control={<Radio />} label="Publikus" />
                                <FormControlLabel value="friends" control={<Radio />} label="Barátok" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <label className="uploadLabel" htmlFor="file" style={{ justifyContent: 'center' }}>
                                <Button style={{ textTransform: 'none' }} className={!fileError ? "uploadBtn" : "uploadBtn_err"} variant="text" component="span" >{file ? file.name : "Fájl kiválasztása..."}
                                </Button></label>
                            <FormHelperText error style={{ textAlign: 'center' }}>{fileMsg}</FormHelperText>
                            <input name="file" id="file" type="file" onChange={handleChange} hidden />
                        </FormControl>
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Mégsem</Button>
                <Button onClick={onSaveNote}>Mentés</Button>
            </DialogActions>
        </Dialog>
    )
}

export function UpdateNoteDialog(props) {
    const note = props.note;
    const [fileError, setFileError] = useState(false);
    const [fileMsg, setFileMsg] = useState("");
    const [file, setFile] = useState(null);

    const [name, setName] = useState(note.name);
    const [nameError, setNameError] = useState(false);
    const [nameMsg, setNameMsg] = useState("");

    const [category, setCategory] = useState(note.category);
    const [catError, setCatError] = useState(false);
    const [catMsg, setCatMsg] = useState("");

    const [description, setDescription] = useState(note.description);
    const [descError, setDescError] = useState(false);
    const [descMsg, setDescMsg] = useState("");

    const [visibility, setVisibility] = useState(note.visibility);

    // Jegyzet mentése
    const onSaveNote = () => {
        const _name = name.trim();
        const _category = category.trim();
        const _visibility = visibility.trim();
        let _description = "";
        if (description) {
            _description = description.trim();
        }

        if (_name !== "" && _category !== "") {
            const token = localStorage.getItem("accessToken");
            const data = new FormData();
            if (file) {
                data.append("file", file);
            }
            data.append("name", _name);
            data.append("category", _category);
            data.append("description", _description);
            data.append("visibility", _visibility);
            updateNote(token, note.id, data).then(response => {
                if (response.status === 200) {
                    handleClose(true);
                    props.getNotes();
                    props.enqueueSnackbar("Jegyzet módosítva!", { variant: 'success' });
                }
            }).catch(error => {
                const message = error.response.data.message;
                if (message && message === "Name already in use!") {
                    props.enqueueSnackbar("Ez a név már foglalt!", {variant: "error"});
                } else {
                    handleClose();
                    props.getNotes();
                    props.enqueueSnackbar("Nem sikerült a jegyzetet módosítani!", { variant: 'error' });
                }
            })
        }
        else {
            if (name === "") {
                setNameError(true);
                setNameMsg("Nem adtál meg nevet!");
            }
            if (category === "") {
                setCatError(true);
                setCatMsg("Nem adtál meg kategóriát!");
            }
        }
    }

    const handleClose = changed => {
        props.handleClose();
        // Ha végül nem történt módosítás, akkor visszaállítjuk az állapotot
        // az eredetire, ellenkező esetben meghagyjuk, hogy legközelebbi megnyitáskor
        // a frissült adatokat lássuk
        if (!changed) {
            setName(note.name);
            setNameError(false);
            setNameMsg("");

            setCategory(note.category);
            setCatError(false);
            setCatMsg("");

            setDescription(note.description);
            setDescError(false);
            setDescMsg("");

            setVisibility(note.visibility);
        }
        setFile(null);
        setFileError(false);
        setFileMsg("");
    }

    const handleChange = event => {
        const name = event.target.name;
        if (name === "file") {
            const _file = event.target.files[0];
            setFile(_file);
            setFileError(false);
            setFileMsg("");
        }
        if (name === "name") {
            setName(event.target.value);
            setNameError(false);
            setNameMsg("");
        }

        if (name === "category") {
            setCategory(event.target.value);
            setCatError(false);
            setCatMsg("");
        }

        if (name === "description") {
            setDescription(event.target.value);
            setDescError(false);
            setDescMsg("");
        }

        if (name === "visibility") {
            setVisibility(event.target.value);
        }
    }

    return (
        <Dialog open={props.open}>
            <DialogTitle>Jegyzet szerkesztése</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <TextField name="name" onChange={handleChange} error={nameError} helperText={nameMsg} required variant="outlined" fullWidth label="Név" value={name} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField name="category" onChange={handleChange} error={catError} helperText={catMsg} required variant="outlined" fullWidth label="Kategória" value={category} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField name="description" onChange={handleChange} error={descError} helperText={descMsg} multiline rows={3} variant="outlined" fullWidth label="Leírás (opcionális)" value={description} />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl required component="fieldset">
                            <FormLabel component="legend">Láthatóság</FormLabel>
                            <RadioGroup style={{ textAlign: 'center' }} fullWidth row aria-label="visibility" name="visibility" value={visibility} onChange={handleChange}>
                                <FormControlLabel value="public" control={<Radio />} label="Publikus" />
                                <FormControlLabel value="friends" control={<Radio />} label="Barátok" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <label className="uploadLabel" htmlFor="file" style={{ justifyContent: 'center' }}>
                                <Button style={{ textTransform: 'none' }} className={!fileError ? "uploadBtn" : "uploadBtn_err"} variant="text" component="span" >{file ? file.name : "Új fájl kiválasztása..."}
                                </Button></label>
                            <FormHelperText error style={{ textAlign: 'center' }}>{fileMsg}</FormHelperText>
                            <input name="file" id="file" type="file" onChange={handleChange} hidden />
                        </FormControl>
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)}>Mégsem</Button>
                <Button onClick={onSaveNote}>Mentés</Button>
            </DialogActions>
        </Dialog>
    )
}