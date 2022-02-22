import React from 'react';
import { withSnackbar } from 'notistack';
import { withRouter } from 'react-router';
import { Backdrop, CircularProgress, Typography, Paper, Grid, Divider } from '@material-ui/core';
import { getAllMessages } from '../../requests/messages';
import { getFriends, getProfile } from '../../requests/users';
import { socket } from '../../config/notification.config';
import { msgSocket } from '../../config/message.config';
import MessageArea from './MessageArea';
import FriendsArea from './FriendsArea';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import "./Messages.scss";

class Messages extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            user: null,
            friends: [],
            chats: [],
            activeId: -1,
            connected: false,
        }
    }

    componentDidMount() {
        this.connectSocket();
        this.getOwnProfile();
        this.getMessages();

        // Új üzenet fogadása, és ha ez az éppen aktív chat ablakban van, akkor olvasottra állítás
        msgSocket.on("receiveMessage", request => {
            const chat = this.state.chats.find(item => item.chat.friendId === this.state.activeId);
            if (chat) {
                msgSocket.emit("readMessage", {
                    sender: this.state.user.id,
                    receiver: chat.chat.friendId
                });
            }
            this.props.update();
            this.getMessages();
        });

        // Értesítés, hogy a cél felhasználó megkapta az üzenetet
        msgSocket.on("messageReceived", () => {
            this.getMessages();
        });

        // Értesítés, hogy a cél felhasználó elolvasta az elküldött üzenetet
        msgSocket.on("messageRead", () => {
            this.props.update();
            this.getMessages();
        });

        // Értesítés, hogy egy felhasználó aktív lett
        socket.on("user_connected", (request) => {
            this.setFriendOnline(parseInt(request));
        });

        // Értesítés, hogy egy felhasználó inaktív lett
        socket.on("user_disconnected", request => {
            this.setFriendOffline(request);
        })
    }

    componentWillUnmount() {
        msgSocket.disconnect();
    }

    componentDidUpdate(prevProps, prevState) {
        // Ha változik az aktív beszélgetés, akkor az új olvasottra állítása
        if (this.state.activeId !== prevState.activeId) {
            const chat = this.state.chats.find(item => item.chat.friendId === this.state.activeId);
            if (chat) {
                msgSocket.emit("readMessage", {
                    sender: this.state.user.id,
                    receiver: chat.chat.friendId
                });
            }
            this.props.update();
            this.getMessages();
        }
    }

    render() {
        return (
            <div>
                {!this.state.loading ?
                    <Grid container component={Paper} className="chatSection">
                        {this.state.friends.length > 0 ?
                            <React.Fragment>
                                <Grid item xs={3} className="borderRight500">
                                    <Divider />

                                    <FriendsArea friends={this.state.friends} chats={this.state.chats} setActiveChat={this.setActiveChat} getMessages={this.getMessages} activeId={this.state.activeId} />

                                </Grid>
                                <Grid item xs={9}>

                                    <MessageArea chats={this.state.chats} activeId={this.state.activeId} user={this.state.user} getMessages={this.getMessages} />

                                </Grid>
                            </React.Fragment>
                            :
                            <Grid item xs={12}>
                                <div style={{ height: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <SentimentVeryDissatisfiedIcon style={{ fontSize: 80 }} />
                                    <Typography variant="h4">Nincsenek események!</Typography>
                                </div>
                            </Grid>
                        }
                    </Grid>
                    : <Backdrop open={true}><CircularProgress /></Backdrop>
                }
            </div>
        )
    }

    connectSocket = () => {
        if (!this.state.connected) {
            //Messages
            msgSocket.connect();
            msgSocket.on('connect', () => { });
            const msgParams = {
                sender: parseInt(localStorage.getItem('userId'))
            }
            msgSocket.emit('joinMessages', msgParams, () => {
                this.setState({ connected: true });
            });
        }
    }

    setActiveChat = (index) => {
        this.setState({ activeId: index });
    }

    getOwnProfile = () => {
        //this.setState({ loading: true })
        const token = localStorage.getItem("accessToken");
        getProfile(token, 'own').then(response => {
            if (response.status === 200) {
                const user = response.data.user;
                if (user.status === "pending") this.props.history.replace("/home");
                else this.setState({ user: response.data.user });
            }
        }).catch(error => { console.log(error.response) })
            .then(() => {
                getFriends(token, 'own').then(response => {
                    const data = response.data;
                    if (data[0]) {
                        this.setState({ friends: data, activeId: data[0].id, loading: false });
                    } else {
                        this.setState({ loading: false });
                    }
                }).catch(error => { });
            })
    }

    // A felhasználó aktívra állítása, az aktivitás jelző 
    // badge-e megjelenik
    setFriendOnline = (id) => {
        let friends = this.state.friends;
        for (let friend of friends) {
            if (friend.id === id) {
                friend.online = true;
            }
        }
        this.setState({ friends: friends });
    }

    // A felhasználó inaktívra állítása, az aktivitás jelző 
    // badge-e eltűnik
    setFriendOffline = (id) => {
        let friends = this.state.friends;
        for (let friend of friends) {
            if (friend.id === id) {
                friend.online = false;
            }
        }
        this.setState({ friends: friends });
    }

    getMessages = () => {
        const token = localStorage.getItem("accessToken");
        getAllMessages(token).then(response => {
            if (response.status === 200) {
                this.setState({ chats: response.data });
            }
        }).catch(error => { console.log(error) });
    }
}
const WithSnackBarMessages = withSnackbar(Messages);
export default withRouter(WithSnackBarMessages);