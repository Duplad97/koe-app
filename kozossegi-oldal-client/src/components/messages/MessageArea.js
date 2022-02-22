import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import {IconButton, InputAdornment, Menu, Tooltip, List, ListItem, ListItemText, Divider, TextField, Typography, Avatar, Grid } from '@material-ui/core';
import moment from 'moment';
import 'moment/locale/hu';
import { BASE_URL } from '../../config/api.config';
import { msgSocket } from '../../config/message.config';
import { socket } from '../../config/notification.config';
import Picker from 'emoji-picker-react';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';

import "./Messages.scss";

////////////////////////////////////////////
const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    headBG: {
        backgroundColor: '#e0e0e0'
    },
    messageArea: {
        height: '70vh',
        overflowY: 'auto',
    }
});

export default function MessageArea(props) {
    const classes = useStyles();
    const messagesEndRef = useRef(null);

    const [message, setMessage] = useState("");
    const [emojiPicker, setEmoijPicker] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const chats = props.chats;
    const chat = chats.find(item => item.chat.friendId === props.activeId);
    let friend;
    let messages;
    let friendSeen; // Látta-e a barátunk a beszélgetést
    let seenAt; // Ha látta, mikor?
    let avatar;
    const user = props.user;
    if (chat) {
        friend = chat.friend;
        messages = chat.chat.messages;
        friendSeen = chat.chat.friendSeen;
        seenAt = chat.chat.seenAt ? moment(chat.chat.seenAt).format("H:mm") : "";
        if ((seenAt !== "") && (moment(seenAt) < moment().subtract(1, 'days'))) {
            seenAt = moment(seenAt).format("MMM Do H:mm");
        }
        avatar = friend.avatar ? BASE_URL + friend.avatar : "";
    }

    // Sok üzenetnél, ha új üzenetet küldünk/új üzenet érkezik
    // akkor a konténer aljára scrollozás.
    useEffect(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    });

    // Üzenet elküldése, és arról a csevegés és az értesítések socket
    // értesítése, hogy az a felhasználó is megkapja az üzenetről az értesítést,
    // aki nem a csevegések oldalon van.
    const sendTheMessage = () => {
        if (message !== "") {
            msgSocket.emit("sendMessage", {
                sender: user.id,
                receiver: props.activeId,
                message: message
            });
            socket.emit("sentMessage", {
                sender: user.id.toString(),
                receiver: props.activeId.toString(),
                message: message,
                from: user,
            });
            setMessage("");
        }
    }

    // Üzenet küldése a küldés gombra kattintva
    const onSendMsg = () => {
        sendTheMessage();
    }

    // Üzenet küldése enter megnyomására
    const sendMsgWithEnter = event => {
        const key = event.key;
        if (key === "Enter") {
            sendTheMessage();
        }
    }

    // Emoji picker megnyitása
    const handlePickerOpen = (event) => {
        setAnchorEl(event.currentTarget);
        setEmoijPicker(true);
    }

    // Emoji picker bezárása
    const handlePickerClose = () => {
        setAnchorEl(null);
        setEmoijPicker(false);
    }

    const onEmojiClick = (event, emojiObject) => {
        setMessage(message + emojiObject.emoji);
    }

    return (
        <React.Fragment>
            <List className={classes.messageArea}>
                {chat ? messages.map((message, index) => {
                    moment.locale("hu");
                    let date = moment(message.createdAt).format("H:mm");
                    if (moment(message.createdAt) < moment().subtract(1, 'days')) {
                        date = moment(message.createdAt).format("MMM Do H:mm");
                    }
                    return (
                        <ListItem>
                            <Grid container>
                                <Grid item xs={12}>
                                    <ListItemText align={message.senderId === user.id ? "right" : "left"} primary={<Typography className={message.senderId === user.id ? "ownMessage" : "friendMessage"} variant="span">{message.message}</Typography>}></ListItemText>
                                </Grid>
                                <Grid item xs={12}>

                                    <ListItemText align={message.senderId === user.id ? "right" : "left"} secondary={
                                        <Typography variant="span" style={friendSeen && (message.senderId === user.id) && (index === messages.length - 1) ? { display: "flex", justifyContent: "right" } : {}} color="textSecondary">
                                            {date}
                                            {friendSeen && (message.senderId === user.id) && (index === messages.length - 1) ?
                                                <Tooltip title={`Látta - ${seenAt}`}>
                                                    <Avatar src={avatar} className={friend.gender !== "female" ? "seenAvatar" : "seenAvatar_female"}>{friend.lastName[0]}{friend.firstName[0]}</Avatar>
                                                </Tooltip>
                                                : ""}
                                        </Typography>
                                    }></ListItemText>
                                </Grid>
                            </Grid>
                        </ListItem>
                    )
                }) : <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <Typography variant="h4">Nincsenek üzenetek!</Typography>
                    <Typography variant="subtitle1">Kezdeményezz beszélgetést!</Typography>
                </div>}
                <div ref={messagesEndRef} />
            </List>

            <Divider />
            <Grid container style={{ padding: '20px' }}>
                <Grid item xs={11}>
                    <TextField variant="outlined" onKeyUp={sendMsgWithEnter} value={message} onChange={event => setMessage(event.target.value)} placeholder="Írj valamit..." fullWidth InputProps={{
                        endAdornment: (
                            <InputAdornment>
                                <IconButton onClick={handlePickerOpen}>
                                    <InsertEmoticonIcon />
                                </IconButton>
                                <Menu className="emoji_menu" style={{ padding: 0 }} open={emojiPicker} onClose={handlePickerClose} anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}>
                                    <Picker className="picker" disableSearchBar onEmojiClick={onEmojiClick} />
                                </Menu>
                            </InputAdornment>
                        )
                    }
                    } />
                </Grid>
                <Grid xs={1} align="right" style={{ display: "flex", alignItems: "center" }}>
                    <IconButton aria-label="add" onClick={onSendMsg}><SendIcon /></IconButton>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}