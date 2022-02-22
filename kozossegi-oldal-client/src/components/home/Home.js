import { Container, Typography, Backdrop, CircularProgress} from '@material-ui/core';
import React from 'react';
import { getProfile } from '../../requests/users';
import Post from './Post';
import { withRouter } from 'react-router';
import { getHomeData } from '../../requests/home';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';

class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            user: null,
            loading: true,
            data: [],
        }
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        return (
            <div>
                {!this.state.loading ?

                    <Container style={{ display: 'block' }}>
                        {this.state.data.length > 0 ? this.state.data.map(post => {
                            return <Post post={post} user={this.state.user} />
                        }) :
                            <div style={{ height: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <SentimentVeryDissatisfiedIcon style={{ fontSize: 80 }} />
                                <Typography variant="h4">Nincsenek események!</Typography>
                            </div>
                        }
                    </Container>
                    :
                    <Backdrop open={true}>
                        <CircularProgress />
                    </Backdrop>
                }
            </div>
        )
    }

    loadData = () => {
        const accessToken = localStorage.getItem("accessToken");
        getProfile(accessToken, "own").then(response => {
            let user = response.data.user;
            user.name = user.lastName + " " + user.firstName;
            user.shortName = user.lastName[0] + user.firstName[0];
            this.setState({ user: user });
        }).catch(error => {
            // Ha nem találtuk meg a felhasználót, akkor valószínleg érvénytelen
            // a hozzá tartozó token, ezért visszairányítjuk a bejelentkező oldalra.
            this.props.history.replace("/login");
        }).then(() => {
            getHomeData(accessToken).then(response => {
                if (response.status === 200) {
                    const data = response.data;
                    // Sorba rendezzük a "posztokat", hogy a legújabb legyen elöl.
                    data.sort((a, b) => a.createdAt < b.createdAt && 1 || -1);
                    this.setState({ data, data, loading: false });
                }
            }).catch(error => { console.log(error.response) });
        })
    }
}

export default withRouter(Home);