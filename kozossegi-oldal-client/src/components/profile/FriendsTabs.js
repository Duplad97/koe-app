import React, { useState } from 'react';
import { Avatar, Container, Typography, Backdrop, Divider, List, ListItemAvatar, ListItem, ListItemText, Chip, IconButton, Tabs, Tab, ListItemSecondaryAction, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, Button } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import { BASE_URL } from '../../config/api.config';
import { useHistory } from 'react-router';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// A profil adatok alatt lévő barátok/függőben lévő jelölések lapfülek
export default function FriendsTabs(props) {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    if (!props.loading) {
        return (
            <Container>
                {props.own ?
                    <Tabs
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={handleChange}
                        value={value}
                    >
                        <Tab label={`Barátok (${props.friends.length})`} />
                        <Tab label={`Függőben lévő jelölések (${props.incRequests.length})`} />
                        <Tab label={`Elküldött jelölések (${props.sentRequests.length})`} />
                    </Tabs>
                    :
                    <Tabs
                        className="tabs"
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={handleChange}
                        value={-1}
                    >
                        <Tab label={`Barátok (${props.friends.length})`} />
                    </Tabs>
                }
                <FriendsPanel onDeleteFriend={props.onDeleteFriend} own={props.own} loading={props.loading} friends={props.friends} value={value} index={0} />

                <PendingPanel incRequests={props.incRequests} onAcceptRequest={props.onAcceptRequest} onDeclineRequest={props.onDeclineRequest} value={value} index={1} />

                <SentPanel sentRequests={props.sentRequests} onCancelRequest={props.onCancelRequest} value={value} index={2} />
            </Container>
        )
    } else {
        return (<Container>
            <Backdrop />
        </Container>)
    }
}

// Barátok lapfül
function FriendsPanel(props) {
    const history = useHistory();
    const userId = localStorage.getItem("userId");
    const [openDialog, setOpenDialog] = useState(false);
    const [key, setKey] = useState(-1);

    const onUserClick = (id) => {
        history.replace(`/profile/${id}`);
    }

    // Törlés megerősítő ablak megnyitás
    const onDeleteClick = id => {
        setOpenDialog(true);
        setKey(id);
    }

    // Törlés megerősítő ablak bezárás
    const onClose = () => {
        setOpenDialog(false);
        setKey(-1);
    }

    return (
        <div className={props.value !== props.index ? "tab hidden" : "tab"}>
            <List className="list">
                {props.friends.length > 0 ? props.friends.map(friend => {
                    friend.shortName = friend.lastName[0] + friend.firstName[0];
                    const avatar = friend.avatar ? BASE_URL + friend.avatar : "";
                    return (<div>
                        <ListItem button>

                            <ListItemAvatar>
                                <Avatar src={avatar} className={friend.gender !== "female" ? "tab_avatar" : "tab_avatar_female"}>{friend.shortName}</Avatar>
                            </ListItemAvatar>

                            <ListItemText
                                onClick={() => onUserClick(friend.id)}
                                style={{ cursor: "pointer" }}
                                primary={
                                    userId == friend.id ?
                                        <div><span>{friend.lastName} {friend.firstName} <Chip size="small" variant="outlined" label="Te" /></span></div>
                                        : `${friend.lastName} ${friend.firstName}`
                                }
                                secondary={friend.school} />

                            {props.own ?
                                // A saját profilunkon tudunk barátokat törölni
                                <ListItemSecondaryAction>
                                    <Tooltip title="Barát törlése">
                                        <IconButton onClick={() => onDeleteClick(friend.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                                : ""
                            }
                        </ListItem>

                        <Divider />

                        {/* Törlés megerősítő ablak (későbbiekben külön functionbe) */}
                        <Dialog
                            open={openDialog && key === friend.id}
                            TransitionComponent={Transition}
                            keepMounted
                            onClose={onClose}
                            key={friend.id}
                        >
                            <DialogTitle >{"Figyelmeztetés!"}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    <span>Biztosan törölni szeretnéd <b>{friend.lastName} {friend.firstName}</b> felhasználót a barátaid közül?</span>
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={onClose} color="primary">
                                    Mégsem
                                </Button>
                                <Button onClick={() => props.onDeleteFriend(friend.id)} color="primary">
                                    Igen
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>)
                }) :
                    <Typography variant="h6" style={{ textAlign: 'center' }}>
                        Nincsenek barátok...
                        <SentimentVeryDissatisfiedIcon style={{ verticalAlign: "middle", marginBottom: 6 }} />
                    </Typography>
                }
            </List>
        </div>
    )
}

// Bejövő függőben lévő barátkérések lapfül
function PendingPanel(props) {
    const history = useHistory();
    const userId = localStorage.getItem("userId");

    const onUserClick = (id) => {
        history.replace(`/profile/${id}`);
    }

    return (
        <div className={props.value !== props.index ? "tab hidden" : "tab"}>
            <List className="list">
                {props.incRequests.length > 0 ? props.incRequests.map(friend => {
                    friend.shortName = friend.lastName[0] + friend.firstName[0];
                    const avatar = friend.avatar ? BASE_URL + friend.avatar : "";

                    return (
                        <React.Fragment>
                            <ListItem button>

                                <ListItemAvatar>
                                    <Avatar src={avatar} className={friend.gender !== "female" ? "tab_avatar" : "tab_avatar_female"}>{friend.shortName}</Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    onClick={() => onUserClick(friend.id)}
                                    style={{ cursor: "pointer" }}
                                    primary={
                                        userId == friend.id ?
                                            <div><span>{friend.lastName} {friend.firstName} <Chip size="small" variant="outlined" label="Te" /></span></div>
                                            : `${friend.lastName} ${friend.firstName}`
                                    }
                                    secondary={friend.school} />

                                <ListItemSecondaryAction>

                                    <Tooltip title="Elfogadás">
                                        <IconButton onClick={() => props.onAcceptRequest(friend.id)}>
                                            <CheckIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Elutasítás">
                                        <IconButton onClick={() => props.onDeclineRequest(friend.id)}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>

                                </ListItemSecondaryAction>

                            </ListItem>
                            <Divider />
                        </React.Fragment>)
                }) :
                    <Typography variant="h6" style={{ textAlign: 'center' }}>
                        Nincsenek függőben lévő felkéréseid...
                    </Typography>}

            </List>
        </div>
    )
}

// Elküldött felkérések lapfül
function SentPanel(props) {
    const history = useHistory();
    const userId = localStorage.getItem("userId");

    const onUserClick = (id) => {
        history.replace(`/profile/${id}`);
    }

    return (
        <div className={props.value !== props.index ? "tab hidden" : "tab"}>
            <List className="list">
                {props.sentRequests.length > 0 ? props.sentRequests.map(friend => {
                    friend.shortName = friend.lastName[0] + friend.firstName[0];
                    const avatar = friend.avatar ? BASE_URL + friend.avatar : "";
                    return (
                        <React.Fragment>
                            <ListItem button>

                                <ListItemAvatar>
                                    <Avatar src={avatar} className={friend.gender !== "female" ? "tab_avatar" : "tab_avatar_female"}>{friend.shortName}</Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    onClick={() => onUserClick(friend.id)}
                                    style={{ cursor: "pointer" }}
                                    primary={
                                        userId == friend.id ?
                                            <div><span>{friend.lastName} {friend.firstName} <Chip size="small" variant="outlined" label="Te" /></span></div>
                                            : `${friend.lastName} ${friend.firstName}`
                                    }
                                    secondary={friend.school} />

                                <ListItemSecondaryAction>

                                    <Tooltip title="Visszavonás">
                                        <IconButton onClick={() => props.onCancelRequest(friend.id)}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>

                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                        </React.Fragment>)
                }) :
                    <Typography variant="h6" style={{ textAlign: 'center' }}>
                        Nincsenek elküldött felkéréseid...
                    </Typography>}

            </List>
        </div>
    )
}