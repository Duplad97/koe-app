import { Avatar, Container, Paper, Typography, Box, Backdrop, Divider, Grid, Chip, Dialog, DialogTitle, DialogContent, IconButton, Tooltip, Menu, MenuItem, CircularProgress } from '@material-ui/core';
import React from 'react';
import { BASE_URL } from '../../config/api.config';
import { getProfile, getFriends, getSentRequests, getIncRequests, deleteFriend, acceptRequest, declineRequest, cancelRequest, sendRequest } from '../../requests/users';
import { getSchools } from '../../requests/auth';

import './Profile.scss';
import CloseIcon from '@material-ui/icons/Close';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CreateIcon from '@material-ui/icons/Create';
import FriendsTabs from './FriendsTabs';
import AvatarButton from './AvatarButton';
import FolderList from './FolderList';
import AvatarUploadDialog from './dialogs/AvatarUploadDialog';
import UpdateProfileDialog from './dialogs/UpdateProfileDialog';

import { withSnackbar } from 'notistack';
import { socket } from '../../config/notification.config';
import { withRouter } from 'react-router';

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            avatar: "",
            role: "",
            user: null,
            own: false,
            loading: true,
            dialogOpen: false,
            friends: [],
            friendStatus: "", // barát / függőben lévő elküldött / függőben lévő bejövő / nem barát
            sentRequests: [],
            incRequests: [],
            anchorEl: null,
            openModifyMenu: false,
            modifyDialog: false,
            avatarDialog: false,
            schools: [],
            active: false,
        };
    }

    componentDidMount() {
        this.whoAmI();
        this.getSchoolsOnLoad();
    }

    render() {
        return (
            <div>
                <Container>
                    {!this.state.loading ?
                        <Paper elevation={4} className="profile_container">
                            <Grid container xs={12} className="headerBox">
                                <Grid item xs={6} className="avatarGrid">
                                    <Box className="avatarBox">

                                        {this.state.avatar === ""
                                            ?
                                            <Avatar className={this.state.user.gender !== "female" ? "profile_avatar" : "profile_avatar_female"}>
                                                {this.state.user.shortName}
                                            </Avatar>
                                            :
                                            <Tooltip title="Profilkép megtekintése">
                                                <Avatar onClick={this.openAvatar} className={this.state.user.gender !== "female" ? "profile_avatar src" : "profile_avatar_female src"} src={this.state.avatar}>
                                                    {this.state.user.shortName}
                                                </Avatar>
                                            </Tooltip>
                                        }

                                        <AvatarButton own={this.state.own} friends={this.state.friends} avatar={this.state.avatar} friendStatus={this.state.friendStatus} user={this.state.user} onDeleteFriend={this.onDeleteFriend} onAcceptRequest={this.onAcceptRequest} onDeclineRequest={this.onDeclineRequest} onCancelRequest={this.onCancelRequest} onSendRequest={this.onSendRequest} handleAvatarDialog={this.handleUploadDialog} whoAmI={this.whoAmI} enqueueSnackbar={this.props.enqueueSnackbar} update={this.props.update} active={this.state.active} />

                                    </Box>
                                </Grid>
                                <Grid item xs={6} className="detailsBox">
                                    <React.Fragment>

                                        <Typography variant="h3" className="profileName">{this.state.user.lastName} {this.state.user.firstName} <Chip variant="outlined" label={this.state.role}></Chip>
                                        </Typography>

                                        {this.state.own ?
                                            <div class="menuButton">
                                                <IconButton onClick={this.handleModifyMenu}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={this.state.anchorEl}
                                                    anchorOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right',
                                                    }}
                                                    keepMounted
                                                    transformOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right',
                                                    }}
                                                    open={this.state.openModifyMenu}
                                                    onClose={this.handleModifyClose}>
                                                    <MenuItem onClick={this.handleModifyDialog}>Profil szerkesztése <CreateIcon style={{ marginLeft: 8 }} /></MenuItem>
                                                </Menu>
                                            </div>
                                            : ""
                                        }
                                    </React.Fragment>

                                    <Divider fullWidth />

                                    <FolderList user={this.state.user} schools={this.state.schools} />

                                </Grid>

                                {this.state.own && !this.state.active ? "" :
                                    <Grid item xs={12}>
                                        <Divider />
                                        <FriendsTabs own={this.state.own} loading={this.state.loading} friends={this.state.friends} sentRequests={this.state.sentRequests} incRequests={this.state.incRequests} onDeleteFriend={this.onDeleteFriend} onAcceptRequest={this.onAcceptRequest} onDeclineRequest={this.onDeclineRequest} onCancelRequest={this.onCancelRequest} />
                                    </Grid>
                                }

                            </Grid>
                        </Paper>
                        :
                        <Backdrop open="true">
                            <CircularProgress />
                        </Backdrop>
                    }
                    {this.state.user ?
                    // Profilkép megtekintésére szolgáló ablak
                        <React.Fragment>
                            <Dialog fullScreen open={this.state.dialogOpen} onClose={this.handleClose} fullWidth maxWidth="lg" style={{ height: 800 }}>
                                <DialogTitle onClose={this.handleClose} style={{ textAlign: 'right', height: 40 }}>
                                    <IconButton onClick={this.handleClose}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent>
                                    <div style={{ textAlign: 'center' }}>
                                        <img src={this.state.avatar} width="1150" />
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Profilkép módosítás ablak */}
                            <AvatarUploadDialog avatar={this.state.avatar} open={this.state.avatarDialog} handleClose={this.handleUploadClose} whoAmI={this.whoAmI} enqueueSnackbar={this.props.enqueueSnackbar} update={this.props.update} />

                            {/* Profilkép szerkesztés ablak */}
                            <UpdateProfileDialog whoAmI={this.whoAmI} enqueueSnackbar={this.props.enqueueSnackbar} user={this.state.user} open={this.state.modifyDialog} onClose={this.handleModifyDialogClose} schools={this.state.schools} update={this.props.update} />

                        </React.Fragment>
                        : ""
                    }
                </Container>
            </div>
        )
    }

    // Kép feltöltés ablak megnyitás
    handleUploadDialog = () => {
        this.setState({ avatarDialog: true });
    }

    // Kép feltöltés ablak bezárás
    handleUploadClose = () => {
        this.setState({ avatarDialog: false });
    }

    // Profil szerkesztő ablak megnyitás
    handleModifyDialog = () => {
        this.setState({ modifyDialog: true, anchorEl: null, openModifyMenu: false });
    }

    // Profil szerkesztő ablak bezárás
    handleModifyDialogClose = () => {
        this.setState({ modifyDialog: false });
    }

    // Profil szerkesztő menü cucc megnyitás 
    handleModifyMenu = event => {
        this.setState({ anchorEl: event.currentTarget, openModifyMenu: true });
    }

    // Profil szerkesztő menü cucc bezárás
    handleModifyClose = () => {
        this.setState({ anchorEl: null, openModifyMenu: false });
    }

    // Profilkép megtekintés
    openAvatar = () => {
        if (this.state.avatar !== "") {
            this.setState({ dialogOpen: true });
        }
    }

    // Profilkép megtekintés bezárása
    handleClose = () => {
        this.setState({ dialogOpen: false });
    }

    // Barát felkérés küldése
    onSendRequest = id => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        sendRequest(token, id).then(response => {
            if (response.status === 200) {
                this.whoAmI();
                this.props.enqueueSnackbar("Barát felkérés elküldve!", { variant: "success" });

                const userId = localStorage.getItem("userId");
                socket.emit("sendNotifications", { sender: userId, receiver: id.toString(), type: "friendRequest", message: `Barát felkérést kaptál!` });

            }
        }).catch(() => {
            this.whoAmI();
            this.props.enqueueSnackbar("Nem sikerült elküldeni a felkérést!", { variant: "error" });
        });
    }

    // Barát törlése
    onDeleteFriend = id => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        deleteFriend(token, id).then(response => {
            if (response.status === 200) {
                this.whoAmI();
                this.setState({ friends: response.data, loading: false });
                this.props.enqueueSnackbar("Barát törölve!", { variant: "success" });
            }
        }).catch(error => {
            this.whoAmI();
            this.props.enqueueSnackbar("Nem sikerült a törlés!", { variant: "error" });
        });
    }

    // Barát felkérés elfogadása
    onAcceptRequest = id => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        acceptRequest(token, id).then(response => {
            if (response.status === 200) {
                this.whoAmI();
                this.props.enqueueSnackbar("Barát felkérés elfogadva!", { variant: "success" });
                this.props.update();

                const userId = localStorage.getItem("userId");
                socket.emit("sendNotifications", { sender: userId, receiver: id.toString(), type: "requestAccept", message: `Elfogadták a felkérésedet!` });
            }
        }).catch(error => {
            this.whoAmI();
            this.props.enqueueSnackbar("Nem sikerült a felkérés elfogadása!", { variant: "error" });
        });
    }

    // Barát felkérés elutasítása
    onDeclineRequest = id => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        declineRequest(token, id).then(response => {
            if (response.status === 200) {
                this.whoAmI();
                this.setState({ incRequests: response.data, loading: false });
                this.props.enqueueSnackbar("Barát felkérés elutasítva!", { variant: "success" });
                this.props.update();

                const userId = localStorage.getItem("userId");
                socket.emit("sendNotifications", { sender: userId, receiver: id.toString(), type: "requestDecline", message: `Elutasították a felkérésedet!` });
            }
        }).catch(error => {
            this.whoAmI();
            this.props.enqueueSnackbar("Nem sikerült a felkérés elutasítása!", { variant: "error" });
        });
    }

    // Barát felkérés visszavonása
    onCancelRequest = id => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        cancelRequest(token, id).then(response => {
            if (response.status === 200) {
                this.whoAmI();
                this.props.enqueueSnackbar("Barát felkérés visszavonva!", { variant: "success" });
                if (!this.state.own) {
                    this.setState({ friendStatus: "" });
                }
            }
        }).catch(error => {
            this.whoAmI();
            this.props.enqueueSnackbar("Nem sikerült a felkérés visszavonása!", { variant: "error" });
        });
    }

    // Az iskolák listájának kérése
    getSchoolsOnLoad = () => {
        getSchools().then(data => {
            this.setState({ schools: data });
        });
    }

    whoAmI = () => {
        this.setState({ loading: true });
        const accessToken = localStorage.getItem("accessToken");
        const id = this.props.match.params.id;
        if (accessToken && id) {
            getProfile(accessToken, id).then(response => {
                if (response.status === 200) {
                    const data = response.data;
                    const own = data.own;
                    const active = data.active;
                    let user = data.user;
                    user.name = user.lastName + " " + user.firstName;
                    user.shortName = user.lastName[0] + user.firstName[0];
                    this.setState({ user: user, own: own, friendStatus: "", active: active });

                    // avatár, és felhasználói szerepkör beállítása (név mellett lévő badge miatt)
                    if (this.state.user.avatar) {
                        this.setState({ avatar: BASE_URL + this.state.user.avatar })
                    } else {
                        this.setState({ avatar: "" });
                    }
                    if (this.state.user.role === "admin") {
                        this.setState({ role: "Admin" });
                    } else {
                        this.setState({ role: "Tag" });
                    }
                    // barátok kérése
                    getFriends(accessToken, this.state.user.id).then(response => {
                        if (response.status === 200) {
                            this.setState({ friends: response.data });
                            if (!this.state.own) {
                                const userId = localStorage.getItem("userId");
                                this.state.friends.forEach(friend => {
                                    if (friend.id == userId)
                                        this.setState({ friendStatus: "friends" });
                                });
                            }
                        }
                    }).catch(error => {
                        this.setState({ loading: false });
                    });

                    // elküldött felkérések
                    getSentRequests(accessToken).then(response => {
                        if (response.status === 200) {
                            this.setState({ sentRequests: response.data });
                            if (!this.state.own) {
                                this.state.sentRequests.forEach(friend => {
                                    if (friend.id == this.state.user.id)
                                        this.setState({ friendStatus: "sent" });
                                })
                            }
                        }
                    }).catch(error => { });

                    // bejövő felkérések
                    getIncRequests(accessToken).then(response => {
                        if (response.status === 200) {
                            this.setState({ incRequests: response.data });
                            if (!this.state.own) {
                                this.state.incRequests.forEach(friend => {
                                    if (friend.id == this.state.user.id)
                                        this.setState({ friendStatus: "inc" });
                                })
                            }
                        }
                    }).catch(error => { });
                }
            }).catch(error => {
                this.props.history.replace("/home");
            }).then(() => {
                this.setState({ loading: false });
            })
        }
    }
} 

const WithSnackbarProfile = withSnackbar(Profile)
export default withRouter(WithSnackbarProfile);