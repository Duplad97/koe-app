import React from 'react';
import { Avatar, Badge, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography, Menu, MenuItem, Tooltip } from '@material-ui/core';
import AccountBox from '@material-ui/icons/AccountBox';
import Close from '@material-ui/icons/Close';
import ExitToApp from '@material-ui/icons/ExitToApp';
import { logout } from '../../requests/auth';
import { withRouter } from 'react-router';
import { BASE_URL } from '../../config/api.config';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ForumIcon from '@material-ui/icons/Forum';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import { socket } from '../../config/notification.config';
import moment from 'moment';
import 'moment/locale/hu';
import { withSnackbar } from 'notistack';
import { getUnreadNotifications, readNotification } from '../../requests/notifications';

import './Layout.scss';

class AuthMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            anchorEl: null,
            avatar: "",
            connected: false,
            notifications: [],
            openNotiMenu: false,
            seenNotifications: false,
            unreadChatCount: this.props.unreadChats.length,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.user) {
            // Komponens update-kor újra megkíséreljük az értesítések socketjéhez
            // való csatlakozást, illetve az olvasatlan értesítések lekérését.
            if (this.props.updated !== prevProps.updated) {
                this.connectSocket();
                this.getUnread();
                this.setState({ seenNotifications: false });
            }
            // Ha a felhasználó módosította a profilképét, akkor az az alkalmazás
            // fejlécében is módosuljon.
            if (this.props.user.avatar !== prevProps.user.avatar) {
                if (this.props.user.avatar) {
                    this.setState({ avatar: BASE_URL + this.props.user.avatar });
                } else {
                    this.setState({ avatar: "" });
                }
            }
        }

        // Ha a csevegések oldalra navigálunk, akkor kis késleltetéssel a szülő
        // komponensben újra elkérjük az olvasatlan beszélgetéseket, hogy
        // a menüponthoz tartozó badge frissülhessen.
        if (this.props.location.pathname !== prevProps.location.pathname) {
            if (this.props.location.pathname === "/messages") {
                setTimeout(() => {
                    this.props.update();
                }, 1200);
            }
        }
    }

    componentDidMount() {
        if (this.props.user.avatar) {
            this.setState({ avatar: BASE_URL + this.props.user.avatar });
        }
        this.getUnread();
        this.connectSocket();
        this.props.getUnreadChats();

        // Ha értesítés érkezik, akkor az olvasatlan értesítéseket újra elkérjük,
        // hogy frissüljön a badge, illetve lebegő értesítésként megjelenítjük az
        // értesítést.
        socket.on('receiveNotifications', request => {
            this.props.update();
            this.getUnread();
            this.setState({ seenNotifications: false });
            this.props.enqueueSnackbar(request, { variant: "info" });
        });

        // Bejövő üzenet esetén lebegő értesítésként megjelenítjük a feladó nevét,
        // profilképét, és az üzenet szövegét.
        socket.on('incMessage', request => {
            this.props.getUnreadChats();
            if (this.props.location.pathname !== "/messages") {
                const from = request.from;
                const avatar = from.avatar ? BASE_URL + from.avatar : "";
                this.props.enqueueSnackbar(
                <div style={{width: "100%", display: "flex", alignItems: 'center'}}>
                    <Avatar src={avatar} className={from.gender !== "female" ? "snackbarAvatar" : "snackbarAvatar_female"}>{from.lastName[0]}{from.firstName[0]}</Avatar>
                    <div style={{marginLeft: 15}}>
                        <Typography display="block">{from.lastName} {from.firstName}</Typography>
                        <Typography display="block" variant="span" style={{color: "#a2a2a2"}}>{request.message}</Typography>
                    </div>
                </div>, {variant: "default" });
            }
        });
    }

    componentWillUnmount() {
        socket.disconnect();
    }

    render() {
        return (
            <div style={{ display: 'inline' }}>

                {this.props.user.status === "active" ?
                    <React.Fragment>
                        <Tooltip title="Emberek felfedezése">
                            <IconButton onClick={this.onPeopleClick} >
                                <Badge badgeContent={this.props.requests.length} max={99} color="error">
                                    <PeopleAltIcon className="icon" />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Üzenetek">
                            <IconButton onClick={this.onMessages}>
                                <Badge badgeContent={this.props.unreadChats.length} max={99} color="error">
                                    <ForumIcon className="icon" />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    </React.Fragment>
                    : ""
                }

                <Tooltip title="Értesítések">
                    <IconButton onClick={this.handleNotiMenu}>
                        <Badge badgeContent={!this.state.seenNotifications ? this.state.notifications.length : 0} color="error" max={99}>
                            <NotificationsIcon className="icon" />
                        </Badge>
                    </IconButton>
                </Tooltip>
                <Menu anchorEl={this.state.anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={this.state.openNotiMenu}
                    onClose={this.handleNotiClose}>
                    <List>
                        <Typography className="notiTitle" variant="subtitle1" ><NotificationsIcon style={{ verticalAlign: 'text-bottom' }} fontSize="small" /> Értesítések </Typography>
                        {this.state.notifications.length === 0 ?
                            <div>
                                <Divider /><Typography style={{ padding: 15 }} variant="subtitle2">Nincsenek olvasatlan értesítéseid...</Typography><Divider />
                            </div>
                            :
                            this.state.notifications.map(noti => {
                                return <NotiMenu noti={noti} />
                            })
                        }
                    </List>
                    {//<Button fullWidth style={{fontSize: 12}}>Összes értesítés</Button>
                    }
                </Menu>


                <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={this.handleMenu}
                    color="inherit"
                >
                    <Avatar className={this.props.user.gender !== "female" ? "avatarIcon" : "avatarIconFemale"}
                        alt={this.props.user.name}
                        src={this.state.avatar}
                    >{this.props.user.shortName}</Avatar>
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
                    open={this.state.open}
                    onClose={this.handleClose}
                >
                    <MenuItem onClick={() => this.onProfile()}>
                        <AccountBox style={{ marginRight: 7 }} />
                        Profil
                    </MenuItem>
                    <MenuItem onClick={() => this.logout()}><ExitToApp style={{ marginRight: 7 }} />Kijelentkezés</MenuItem>
                    <MenuItem onClick={this.handleClose}><Close style={{ marginRight: 7 }} />Bezár</MenuItem>
                </Menu>
            </div>
        )
    }

    onMessages = () => {
        this.props.history.push("/messages");
    }

    onPeopleClick = () => {
        this.props.history.push("/people");
    }

    connectSocket = () => {
        if (!this.state.connected) {
            //Notifications
            socket.connect();
            socket.on('connect', () => { });
            const params = {
                sender: localStorage.getItem('userId')
            }
            socket.emit('joinNotifications', params, () => {
                this.setState({ connected: true });
            });
        }
    }

    getUnread = () => {
        const accessToken = localStorage.getItem("accessToken");
        getUnreadNotifications(accessToken).then(response => {
            if (response.status === 200) {
                let notifications = response.data;
                // Sorba rendezzük az értesítéseket, hogy a legújabb legyen felül.
                notifications.sort((a, b) => a.createdAt < b.createdAt && 1 || -1);
                this.setState({ notifications: notifications });
            }
        }).catch(error => {})
    }

    onProfile = () => {
        this.setState({ anchorEl: null })
        this.setState({ open: false });
        this.props.history.push(`/profile/own`, { user: this.props.user });
    }

    // Profil menü bezárása
    handleClose = () => {
        this.setState({ anchorEl: null })
        this.setState({ open: false });
    }

    // Értesítések bezárása
    handleNotiClose = () => {
        this.setState({ anchorEl: null })
        this.setState({ openNotiMenu: false });
        this.getUnread();
    }

    // Profil menü megnyitása
    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget })
        this.setState({ open: true });
    }

    // Értesítések megnyitása, és az ott lévő értesítések
    // olvasottra módosítása.
    handleNotiMenu = event => {
        const accessToken = localStorage.getItem("accessToken");
        this.state.notifications.forEach(noti => {
            readNotification(accessToken, noti.id).then(() => { }
            ).catch(() => { });
        })

        this.setState({ anchorEl: event.currentTarget })
        this.setState({ openNotiMenu: true, seenNotifications: true });
    }

    logout = () => {
        const accessToken = localStorage.getItem("accessToken");
        logout(accessToken).then(response => {
            if (response.status === 200) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userId");
                this.setState({ anchorEl: null })
                this.setState({ open: false, connected: false });
                socket.disconnect();
                this.props.history.replace("/login");
                this.props.logout();
            }
        }).catch(error => {
        })
    }
}

const WithRouterAuthMenu = withRouter(AuthMenu);

export default withSnackbar(WithRouterAuthMenu);

// Értesítésekhez tartozó lista elem
function NotiMenu(props) {
    moment.locale("hu");
    const shortName = props.noti.senderName.split(" ")[0][0] + props.noti.senderName.split(" ")[1][0];
    const date = moment(props.noti.createdAt).fromNow()
    return (
        <div>
            <Divider />
            <ListItem>
                <ListItemAvatar>
                    <Avatar className={props.noti.senderGender !== "female" ? "notiAvatar" : "notiAvatar_female"} src={props.noti.senderAvatar ? BASE_URL + props.noti.senderAvatar : ""}>{shortName}</Avatar></ListItemAvatar>
                <ListItemText primary={<span class="notiText"><b>{props.noti.senderName} </b> {props.noti.message}</span>} secondary={<span>{date}</span>} />
            </ListItem>
            <Divider />
        </div>
    )
}

/*
const StyledBadge = withStyles((theme) => ({
    badge: {
        backgroundColor: 'orange',
        color: 'orange',
        boxShadow: `0 0 0 1px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: '$ripple 1.2s infinite ease-in-out',
            border: '2px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.4)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}))(Badge);*/