import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { ListSubheader, Badge, Grid, Divider, TextField, Avatar, ListItemText, ListItemIcon, ListItem, List, Typography } from '@material-ui/core';
import moment from 'moment';
import 'moment/locale/hu';
import { BASE_URL } from '../../config/api.config';

import "./Messages.scss";

////////////////////////////////////////////
// Aktivitás jelző badge (kis zöld pulzáló pötty)
const StyledBadge = withStyles((theme) => ({
    badge: {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: '$ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}))(Badge);

export default function FriendsArea(props) {
    const [filteredFriends, setFilteredFriends] = useState(props.friends);
    const chats = props.chats;

    // Kereső mező szövegének változásakor a barát lista frissítése
    const handleTermChange = event => {
        const term = event.target.value;
        if (term !== "") {
            setFilteredFriends(prevState => {
                let _filteredFriends = [];
                for (let friend of props.friends) {
                    const name = `${friend.lastName} ${friend.firstName}`;
                    if (name.trim().toLowerCase().includes(term.trim().toLowerCase())) {
                        _filteredFriends.push(friend);
                    }
                }
                return _filteredFriends;
            })
            
        } else {
            setFilteredFriends(prevState => {
                return props.friends;
            });
        }
    }

    return (
        <React.Fragment>
            <Grid item xs={12} style={{ padding: '10px' }}>
                <TextField onChange={handleTermChange} id="outlined-basic-email" label="Keresés" variant="outlined" fullWidth />
            </Grid>
            <Divider />
            <List>
                <ListSubheader>
                    <Typography variant="subtitle1">Barátok</Typography>
                </ListSubheader>

                {filteredFriends.length > 0 ? filteredFriends.map((friend) => {
                    const avatar = friend.avatar ? BASE_URL + friend.avatar : "";
                    // Megnézzük, hogy az adott felhasználóval van-e már aktív beszélgetésünk
                    const chat = chats.find(item => item.chat.friendId === friend.id);
                    let lastMessage;
                    let msgTxt = "";
                    let date = "";
                    let seen;
                    if (chat) {
                        seen = chat.chat.seen;
                        //let friendSeen = chat.chat.friendSeen;
                        lastMessage = chat.chat.messages[chat.chat.messages.length - 1];
                        if (lastMessage) {
                            // Ha az utolsó üzenete mi küldtük, akkor a "Te:" prefix jelenjen meg előtte
                            msgTxt = lastMessage.senderId === friend.id ? lastMessage.message : "Te: " + lastMessage.message;
                            moment.locale("hu");
                            date = moment(lastMessage.createdAt).format("H:mm");
                        }
                    }
                    return (
                        <ListItem button onClick={() => props.setActiveChat(friend.id)} className={props.activeId === friend.id ? "activeFriend" : ""}>

                            <ListItemIcon>
                                {friend.online ?
                                    <StyledBadge
                                        overlap="circular"
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        variant="dot"
                                    >
                                        <Avatar style={chat && !seen ? { border: '3px solid #00b0ff' } : {}} className={friend.gender !== "female" ? "msgAvatar" : "msgAvatar_female"} src={avatar}>{friend.lastName[0]}{friend.firstName[0]}</Avatar>
                                    </StyledBadge>

                                    : <Avatar style={chat && !seen ? { border: '3px solid #00b0ff' } : {}} className={friend.gender !== "female" ? "msgAvatar" : "msgAvatar_female"} src={avatar}>{friend.lastName[0]}{friend.firstName[0]}</Avatar>}
                            </ListItemIcon>

                            <ListItemText
                                primary={<Typography style={chat && !seen ? { fontWeight: "bold" } : {}} type="body2">{friend.lastName} {friend.firstName}</Typography>}

                                // Ha nincs még aktív beszélgetésünk az adott felhasználóval, akkor
                                // "Kezdeményezz beszélgetést!" felirat lesz az utolsó üzenet helyett.
                                secondary={<Typography style={chat && !seen ? { fontWeight: "bold" } : {}} variant="span" color="textSecondary">{chat ? msgTxt : "Kezdeményezz beszélgetést!"}</Typography>} />

                            <ListItemText secondary={<Typography style={chat && !seen ? { fontWeight: "bold" } : {}} variant="span" color="textSecondary">{chat ? date : ""}</Typography>} />
                        </ListItem>
                    )
                }) : 
                <div style={{display: 'flex', width: '100%', height: '50vh', justifyContent: 'center', alignItems: 'center'}}>
                    <Typography variant="h5" style={{display: 'block'}}>Nincs találat...</Typography>
                </div>
                }

            </List>
        </React.Fragment>
    )
}

