import React, { useState } from 'react';
import { Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormHelperText, FormControl } from '@material-ui/core';
import { uploadAvatar } from '../../../requests/users';

export default function AvatarUploadDialog(props) {
    const [avatarSrc, setAvatarSrc] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = event => {
        const file = event.target.files[0];
        setAvatarSrc(URL.createObjectURL(file))
        setAvatar(file);
        if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif") {
            setError(true);
            setErrorMsg("A fájlnak kép formátumúnak kell lennie!");
        } else {
            setError(false);
            setErrorMsg("");
        }
    }

    const handleClose = () => {
        props.handleClose();
        setAvatarSrc(null);
        setAvatar(null);
        setError(false);
        setErrorMsg("");
    }

    const submitAvatar = () => {
        const token = localStorage.getItem("accessToken");
        if (avatar !== null && !error) {
            uploadAvatar(token, avatar).then(response => {
                if (response.status === 200) {
                    handleClose();
                    props.whoAmI();
                    props.update();
                    props.enqueueSnackbar("Profilkép feltöltve!", { variant: 'success' });
                }
            }).catch(error => {
                handleClose();
                props.whoAmI();
                props.update();
                props.enqueueSnackbar("Profilkép feltöltése nem sikerült!", { variant: "error" });
            })
        } else {
            if (avatar === null) {
                setError(true);
                setErrorMsg("Nem választottál képet!")
            }
        }
    }

    return (
        <Dialog open={props.open} onClose={handleClose}>
            <DialogTitle>Profilkép feltöltése</DialogTitle>
            <DialogContent className="uploadDialogContent">
                <Avatar className="uploadAvatar" src={avatarSrc}></Avatar>
                <FormControl>
                    <label class="uploadLabel" htmlFor="avatar">
                        <Button style={{ textTransform: 'none' }} className={!error ? "uploadBtn" : "uploadBtn_err"} variant="text" component="span" >{avatar ? avatar.name : "Kép kiválasztása..."}
                        </Button></label>
                    <FormHelperText error style={{ textAlign: 'center' }}>{errorMsg}</FormHelperText>
                    <input name="avatar" id="avatar" type="file" accept="image/*" onChange={handleChange} hidden />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Mégsem</Button>
                <Button onClick={submitAvatar}>Feltöltés</Button>
            </DialogActions>
        </Dialog>
    )
}