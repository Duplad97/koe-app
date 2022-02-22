import React from 'react';
import { Paper, Container, Tabs, Tab, Backdrop, CircularProgress } from '@material-ui/core';
import { withSnackbar } from 'notistack';
import ExploreTab from './tabs/ExploreTab';
import FriendsTab from './tabs/FriendsTab';
import PendingTab from './tabs/PendingTab';
import SentTab from './tabs/SentTab';
import { getExplorable, getFriends, getIncRequests, getProfile, getSentRequests } from '../../requests/users';
import './People.scss';

class People extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            value: 0,
            explorable: [],
            filtExplorable: [],
            friends: [],
            filtFriends: [],
            pending: [],
            filtPending: [],
            sent: [],
            filtSent: [],
        }
    }

    componentDidMount() {
        this.whoAmI();
    }

    render() {
        return (
            <Container>
                {!this.state.loading ?
                    <Paper elevation={4} style={{ padding: 25 }}>

                        <div>
                            <Tabs
                                indicatorColor="primary"
                                textColor="primary"
                                onChange={this.handleChange}
                                value={this.state.value}
                                style={{ marginBottom: 30 }}
                            >
                                <Tab label="Emberek felfedezése" />
                                <Tab label="Barátok" />
                                <Tab label={this.state.pending.length > 0 ? `Függöben lévő jelölések (${this.state.pending.length})` : "Függőben lévő jelölések" }/>
                                <Tab label="Elküldött jelölések" />
                            </Tabs>

                            <ExploreTab value={this.state.value} index={0} explorable={this.state.filtExplorable} whoAmI={this.whoAmI} onSearch={this.onSearch} enqueueSnackbar={this.props.enqueueSnackbar} />

                            <FriendsTab value={this.state.value} index={1} friends={this.state.filtFriends} whoAmI={this.whoAmI} onSearch={this.onSearch} enqueueSnackbar={this.props.enqueueSnackbar} />

                            <PendingTab value={this.state.value} index={2} pending={this.state.filtPending} whoAmI={this.whoAmI} onSearch={this.onSearch} enqueueSnackbar={this.props.enqueueSnackbar} update={this.props.update} updateRequests={this.props.updateRequests} />

                            <SentTab value={this.state.value} index={3} sent={this.state.filtSent} whoAmI={this.whoAmI} onSearch={this.onSearch} enqueueSnackbar={this.props.enqueueSnackbar} />
                        </div>
                    </Paper>
                    :
                    <Backdrop open={true}>
                        <CircularProgress />
                    </Backdrop>
                }

            </Container>
        )
    }

    handleChange = (event, newValue) => {
        this.setState({ value: newValue });
    }

    // Felhasználók közötti keresés a paraméterben megadott lapfülhöz
    // tartozó listában.
    onSearch = (target, term) => {
        if (target === "explore") {
            let result = [];
            this.state.explorable.forEach(user => {
                const name = `${user.lastName} ${user.firstName}`;
                const school = user.school;
                if (name.toLowerCase().includes(term.toLowerCase()) || school.toLowerCase().includes(term.toLowerCase())) {
                    result.push(user);
                }
            })
            this.setState({ filtExplorable: result });
        }
        if (target === "friends") {
            let result = [];
            this.state.friends.forEach(user => {
                const name = `${user.lastName} ${user.firstName}`;
                const school = user.school;
                if (name.toLowerCase().includes(term.toLowerCase()) || school.toLowerCase().includes(term.toLowerCase())) {
                    result.push(user);
                }
            })
            this.setState({ filtFriends: result });
        }
        if (target === "pending") {
            let result = [];
            this.state.pending.forEach(user => {
                const name = `${user.lastName} ${user.firstName}`;
                const school = user.school;
                if (name.toLowerCase().includes(term.toLowerCase()) || school.toLowerCase().includes(term.toLowerCase())) {
                    result.push(user);
                }
            })
            this.setState({ filtPending: result });
        }
        if (target === "sent") {
            let result = [];
            this.state.sent.forEach(user => {
                const name = `${user.lastName} ${user.firstName}`;
                const school = user.school;
                if (name.toLowerCase().includes(term.toLowerCase()) || school.toLowerCase().includes(term.toLowerCase())) {
                    result.push(user);
                }
            })
            this.setState({ filtSent: result });
        }
    }

    whoAmI = () => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        const id = "own";

        // Felhasználói fiók aktivitás ellenőrzése, majd a lapfülekhez
        // tartozó adatok kérése.
        getProfile(token, id).then(response => {
            if (response.status === 200) {
                const user = response.data.user;
                if (user.status === "pending") this.props.history.replace("/home");
            }
        }).then(() => {
            getExplorable(token).then(response => {
                if (response.status === 200) {
                    this.setState({ explorable: response.data, filtExplorable: response.data });
                }
            }).catch(error => { });

            getFriends(token, id).then(response => {
                if (response.status === 200) {
                    this.setState({ friends: response.data, filtFriends: response.data });
                }
            }).catch(error => { });

            getIncRequests(token).then(response => {
                if (response.status === 200) {
                    this.setState({ pending: response.data, filtPending: response.data });
                }
            }).catch(error => { });

            getSentRequests(token).then(response => {
                if (response.status === 200) {
                    this.setState({ sent: response.data, loading: false, filtSent: response.data });
                }
            }).catch(error => { });
        }).catch(error => { })
    }
}
export default withSnackbar(People);