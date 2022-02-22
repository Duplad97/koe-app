import React from "react";
import { Backdrop, CircularProgress, Container, Divider, List, ListItem, ListItemText, Paper, Typography, Button } from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBack";
import { withSnackbar } from "notistack";
import { withRouter } from "react-router";
import { getSubmittedAnswers, getSurveyById } from "../../../requests/surveys";
import { getProfile } from "../../../requests/users";

class AnsweredSurvey extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            survey: null,
            questions: [],
        }
    }

    componentDidMount() {
        this.getSurvey();
    }

    render() {
        return (
            <Container>
                {!this.state.loading ?

                    <Paper elevation={4} style={{ padding: 25 }}>

                        <Button onClick={this.onGoBack} startIcon={<ArrowBack />} style={{ marginBottom: 10 }}>Vissza a kérdőívekhez</Button>

                        <Typography variant="h4" style={{ textAlign: "center" }}>{this.state.survey.name}</Typography>
                        <Typography variant="subtitle1" color="textSecondary" style={{ textAlign: "center" }}>Készítő: {this.state.survey.user.lastName} {this.state.survey.user.firstName}</Typography>
                        <Typography variant="subtitle1" color="textSecondary" style={{ textAlign: "center" }}>Dátum: {new Date(this.state.survey.createdAt).toLocaleDateString()}</Typography>

                        <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                        <Typography variant="h6">Kérdések</Typography>
                        <List>
                            {this.state.questions.map((question, index = 0) => {
                                index++;
                                return <AnswerListItem question={question.question} answer={question.answers[0].answer} index={index} type={question.type} />
                            })}
                        </List>
                    </Paper>

                    : <Backdrop open={true}><CircularProgress /></Backdrop>
                }
            </Container>
        )
    }

    onGoBack = () => {
        this.props.history.push("/surveys");
    }

    getSurvey = () => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        getProfile(token, "own").then(response => {
            if (response.status === 200) {
                const user = response.data.user;
                if (user.status === "pending") this.props.history.replace("/home");
            }
        }).then(() => {
            const id = this.props.match.params.id;
            getSurveyById(token, id).then(response => {
                if (response.status === 200) {
                    const data = response.data;
                    this.setState({ survey: data.survey });
                }
            }).catch(error => { this.props.history.replace("/home") })
                .then(() => {
                    getSubmittedAnswers(token, id).then(response => {
                        if (response.status === 200) {
                            const data = response.data;
                            this.setState({ questions: data.questions, loading: false });
                        }
                    }).catch(error => { console.log(error.response) });
                });
        }).catch(error => { });
    }
}

const WithSnackbarAnswererSurvey = withSnackbar(AnsweredSurvey);
export default withRouter(WithSnackbarAnswererSurvey);

// Válasz lista elem
function AnswerListItem(props) {

    // Típus szép szöveggé alakítás
    const type = () => {
        if (props.type === "simple_text") return "Egysoros szöveg";
        if (props.type === "multiline_text") return "Többsoros szöveg";
        if (props.type === "choice") return "Feleletválasztó";
        if (props.type === "checkbox") return "Jelölőnégyzet";
        if (props.type === "points_1-5") return "Pontozás (1-5)";
        if (props.type === "points_1-10") return "Pontozás (1-10)";
    }

    // Válasz checkbox-nál és pontozós kérdésnél
    const answer = () => {
        if (props.type === "checkbox" && props.answer === "checked") return "Igen";
        if (props.type === "checkbox" && props.answer === "unchecked") return "Nem";
        if (props.type.includes("points")) return props.answer + " pont";
        else return props.answer;
    }

    return (
        <React.Fragment>
            <ListItem>
                <ListItemText primary={`${props.index}. ${props.question}`}
                    secondary={`Típus: ${type()}`} style={{ width: '55%' }} />
                <ListItemText primary="Válaszod:" secondary={answer()} style={{ width: '45%' }} />
            </ListItem>
            <Divider />
        </React.Fragment>
    )
}