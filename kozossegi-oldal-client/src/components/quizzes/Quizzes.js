import React from "react";
import { withRouter } from "react-router";
import { withSnackbar } from "notistack";
import { Container, Paper, BottomNavigation, BottomNavigationAction, Divider, Box, Backdrop, CircularProgress } from "@material-ui/core";
import PublicIcon from '@material-ui/icons/Public';
import PersonIcon from '@material-ui/icons/Person';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import BrowseQuizzes from "./tabs/BrowseQuizzes";
import OwnQuizzes from "./tabs/OwnQuizzes";
import Scores from "./tabs/Scores";
import { getAllQuizzes, getOwnQuizzes, getOwnScores } from "../../requests/quizzes";
import { getProfile } from "../../requests/users";

import './Quizzes.scss';

class Quizzes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            active: 0,
            allQuizzes: [],
            ownQuizzes: [],
            scores: [],
        }
    }

    componentDidMount() {
        this.getQuizzes();

        // Amikor a kvíz eredményekből visszalépünk, akkor a harmadik tabon legyünk
        if (this.props.location.state) {
            const index = this.props.location.state.index;
            this.setState({ active: index });
        }
    }

    render() {
        return (
            <Container>
                {!this.state.loading ?
                    <Paper elevation={4} style={{ padding: 25 }}>
                        <Box style={{ height: '75vh' }}>

                            <BrowseQuizzes index={0} value={this.state.active} quizzes={this.state.allQuizzes} getQuizzes={this.getQuizzes} />

                            <OwnQuizzes index={1} value={this.state.active} enqueueSnackbar={this.props.enqueueSnackbar} quizzes={this.state.ownQuizzes} getQuizzes={this.getQuizzes} />

                            <Scores index={2} value={this.state.active} scores={this.state.scores} />
                            
                        </Box>

                        <Divider />

                        <BottomNavigation
                            value={this.state.active}
                            showLabels
                            style={{ width: '100%', justifyContent: 'space-evenly' }}
                            onChange={this.handleChange}
                        >
                            <BottomNavigationAction label="Böngészés" icon={<PublicIcon />} />
                            <BottomNavigationAction label="Saját" icon={<PersonIcon />} />
                            <BottomNavigationAction label="Eredmények" icon={<EmojiEventsIcon />} />

                        </BottomNavigation>

                    </Paper>
                    : <Backdrop open={true}><CircularProgress /></Backdrop>
                }
            </Container>
        )
    }

    handleChange = (event, newValue) => {
        this.getQuizzes();
        this.setState({ active: newValue });
    }

    getQuizzes = () => {
        const token = localStorage.getItem("accessToken");
        getProfile(token, "own").then(response => {
            if (response.status === 200) {
                const user = response.data.user;
                if (user.status === "pending") this.props.history.replace("/home");
            }
        }).then(() => {
            getAllQuizzes(token).then(response => {
                if (response.status === 200) {
                    this.setState({ allQuizzes: response.data });
                }
            }).catch(error => { })
                .then(() => {
                    getOwnQuizzes(token).then(response => {
                        if (response.status === 200) {
                            this.setState({ ownQuizzes: response.data });
                        }
                    }).catch(error => { })
                        .then(() => {
                            getOwnScores(token).then(response => {
                                if (response.status === 200) {
                                    this.setState({ scores: response.data, loading: false });
                                }
                            }).catch(error => { });
                        })
                });
        }).catch(error => { });
    }
}

const QuizzesWithRouter = withRouter(Quizzes);
export default withSnackbar(QuizzesWithRouter);