import React from "react";
import { withRouter } from "react-router";
import { withSnackbar } from "notistack";
import { Container, Paper, Tabs, Tab, Fab, Tooltip, Backdrop, CircularProgress } from '@material-ui/core';
import NewSurveys from "./tabs/NewSurveys";
import AnsweredSurveys from "./tabs/AnsweredSurveys";
import OwnSurveys from "./tabs/OwnSurveys";
import AddIcon from '@material-ui/icons/Add';
import { NewSurveyFormDialog } from "./forms/NewSurveyForm";
import { getAllSurveys, getOwnSurveys } from "../../requests/surveys";
import { getProfile } from "../../requests/users";

import './Surveys.scss';

class Surveys extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            value: 0,
            openNewDialog: false,
            unanswered_srvys: [],
            answered_srvys: [],
            own_srvys: []
        }
    }

    componentDidMount() {
        this.getSurveys();
    }

    render() {
        return (
            <Container>
                {!this.state.loading ?
                    <React.Fragment>
                        <Paper elevation={4} style={{ padding: 20 }}>
                            <Tabs
                                indicatorColor="primary"
                                textColor="primary"
                                onChange={this.handleChange}
                                value={this.state.value}
                                style={{ marginBottom: 30 }}
                            >
                                <Tab label="Kitöltetlen kérdőívek" />
                                <Tab label="Kitöltött kérdőívek" />
                                <Tab label="Saját kérdőíveim" />
                            </Tabs>

                            <NewSurveys index={0} value={this.state.value} surveys={this.state.unanswered_srvys} />
                            <AnsweredSurveys index={1} value={this.state.value} surveys={this.state.answered_srvys} />
                            <OwnSurveys index={2} value={this.state.value} surveys={this.state.own_srvys} getSurveys={this.getSurveys} enqueueSnackbar={this.props.enqueueSnackbar} />

                        </Paper>
                        <Tooltip title="Új kérdőív">
                            <Fab onClick={this.onOpenNewDialog} className="fab" color="primary"><AddIcon /></Fab>
                        </Tooltip>

                        <NewSurveyFormDialog open={this.state.openNewDialog} handleClose={this.closeNewDialog} enqueueSnackbar={this.props.enqueueSnackbar} getSurveys={this.getSurveys} />
                    </React.Fragment>
                    :
                    <Backdrop open={true}><CircularProgress /></Backdrop>
                }
            </Container>
        )
    }

    // Új kérdőív létrehozó ablak megnyitása
    onOpenNewDialog = () => {
        this.setState({ openNewDialog: true });
    }

    // Új kérdőív létrehozó ablak bezárása
    closeNewDialog = () => {
        this.setState({ openNewDialog: false });
    }

    handleChange = (event, newValue) => {
        this.getSurveys();
        this.setState({ value: newValue });
    }

    getSurveys = () => {
        //this.setState({loading: true});
        const token = localStorage.getItem("accessToken");
        getProfile(token, "own").then(response => {
            if (response.status === 200) {
                const user = response.data.user;
                if (user.status === "pending") this.props.history.replace("/home");
            }
        }).then(() => {
            getAllSurveys(token).then(response => {
                if (response.status === 200) {
                    const surveys = response.data;
                    const userId = localStorage.getItem("userId");
                    let answered = [];
                    let unanswered = [];
                    for (let survey of surveys) {
                        let isAnswered = false;
                        // Szétválasztjuk az összes kérdőívet megválaszolt, és megválaszolatlanokra
                        for (let question of survey.questions) {
                            for (let answer of question.answers) {
                                if (parseInt(answer.userId) === parseInt(userId)) {
                                    isAnswered = true;
                                }
                            }
                        }
                        if (isAnswered) answered.push(survey);
                        else unanswered.push(survey);
                    }
                    this.setState({ unanswered_srvys: unanswered, answered_srvys: answered, loading: false });
                }
            }).catch(error => { this.setState({ loading: false }) });

            getOwnSurveys(token).then(response => {
                if (response.status === 200) {
                    this.setState({ own_srvys: response.data })
                }
            }).catch(error => { console.log(error) });
        }).catch(error => { });
    }
}

const SurveysWithRouter = withRouter(Surveys);
export default withSnackbar(SurveysWithRouter);