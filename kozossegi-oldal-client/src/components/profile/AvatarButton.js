import { Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import React, { useState } from 'react';
import { uploadAvatar } from '../../requests/users';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckIcon from '@material-ui/icons/Check';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { AlertDialogSlideProfile } from './dialogs/AlertDialogSlide';

import './Profile.scss';

// A profilkép alatt megjelenő gomb
export default function AvatarButton(props) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    // A barát törléséhez tartozó menü cucc megnyitása
    const handleMenu = event => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    }

    // A barát törléséhez tartozó menü cucc bezárása
    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false);
    }

    // A barát törlés megerősítő ablak megnyitása
    const onOpenDialog = () => {
        setOpenDialog(true);
    }
    // A barát törlés megerősítő ablak bezárása
    const onCloseDialog = () => {
        setOpenDialog(false);
    }

    // Profilkép törlése, amely valójában egy fájl nélküli feltöltés
    const onDeleteAvatar = () => {
        const token = localStorage.getItem("accessToken");
        uploadAvatar(token, null).then(response => {
            if (response.status === 200) {
                handleClose();
                props.whoAmI();
                props.update();
                props.enqueueSnackbar("Profilkép törölve!", { variant: 'success' });
            }
        }).catch(error => {
            handleClose();
            props.whoAmI();
            props.update();
            props.enqueueSnackbar("Profilkép feltöltése nem sikerült!", { variant: "error" });
        })
    }

    if (props.own) {
        // Ha a saját profilunkon vagyunk, akkor egy profilkép feltöltés/módosítás gomb,
        // annak függvényében, hogy van-e már feltöltve kép, illetve ha van, akkor
        // egy profilkép törlése menü.
        return (
            <div className={props.avatar !== "" ? "avatarButton" : "avatarButton_none"}>
                <Button
                    onClick={props.handleAvatarDialog}
                    variant="contained"
                    color="primary"
                    startIcon={<AddAPhotoIcon />}
                    disabled={!props.active}
                >
                    {props.avatar === "" ? "Profilkép feltöltése" : "Profilkép módosítása"}
                </Button>
                {props.avatar !== "" && props.active ?
                    <div>
                        <IconButton onClick={handleMenu}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={open}
                            onClose={handleClose}>
                            <MenuItem onClick={onDeleteAvatar}>Profilkép törlése <DeleteIcon style={{ marginLeft: 8 }} /></MenuItem>
                        </Menu>
                    </div>
                    : ""}
            </div>
        )
    } if (props.friendStatus === "friends") {
        // Ha egy barátunk profilján vagyunk, akkor egy nem kattintható "barátok" gomb
        // illetve egy barát törlés menü.
        return (
            <div style={{ marginRight: -35, marginTop: 25 }}>
                <Button
                    variant="outlined"
                    color="success"
                    style={{ cursor: 'default' }}
                    endIcon={<CheckCircleIcon />}
                >
                    Barátok
                </Button>
                {props.active ?
                    <React.Fragment>
                        <IconButton onClick={handleMenu}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={open}
                            onClose={handleClose}>
                            <MenuItem onClick={onOpenDialog}>Barát törlése <DeleteIcon style={{ marginLeft: 8 }} /></MenuItem>
                        </Menu>
                    </React.Fragment>
                    : ""
                }
                <AlertDialogSlideProfile open={openDialog} id={props.user.id} text={<span>Biztosan törölni szeretnéd <b>{props.user.lastName} {props.user.firstName}</b> felhasználót a barátaid közül?</span>} onDeleteFriend={props.onDeleteFriend} handleClose={onCloseDialog} />
            </div>
        )
    } if (props.friendStatus === "sent" && props.active) {
        // Ha a felhasználónak mi küldtünk felkérést, és az még függőben van, akkor egy
        // visszavonás gomb
        return (
            <Button
                onClick={() => props.onCancelRequest(props.user.id)}
                variant="contained"
                color="primary"
                style={{ marginTop: 25 }}
                endIcon={<CloseIcon />}
            >
                Jelölés visszavonása
            </Button>
        )
    } if (props.friendStatus === "inc" && props.active) {
        // Ha függőben lévő bejövő felkérésünk van a felhasználótól, akkor
        // egy elfogadás és egy elutasítás gomb.
        return (
            <div style={{ display: 'flex', justifyContent: "space-between" }}>
                <Button
                    onClick={() => props.onAcceptRequest(props.user.id)}
                    variant="contained"
                    color="primary"
                    style={{ marginTop: 25, marginLeft: -15 }}
                    endIcon={<CheckIcon />}
                >
                    Elfogadás
                </Button>
                <Button
                    onClick={() => props.onDeclineRequest(props.user.id)}
                    variant="contained"
                    color="primary"
                    style={{ marginTop: 25, marginLeft: 15 }}
                    endIcon={<CloseIcon />}
                >
                    Elutasítás
                </Button>
            </div>
        )
    } else {
        // Ha a felhasználó nem a barátunk, és nincs függőben felkérésünk vele,
        // akkor egy barátnak jelölés gomb.
        return (
            <Button
                onClick={() => props.onSendRequest(props.user.id)}
                variant="contained"
                color="primary"
                style={{ marginTop: 25 }}
                endIcon={<PersonAddIcon />}
                disabled={!props.active}
            >
                Barátnak jelölés
            </Button>
        )
    }
}