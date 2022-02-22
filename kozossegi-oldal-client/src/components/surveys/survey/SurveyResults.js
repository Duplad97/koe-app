import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Backdrop, CircularProgress, List, ListSubheader, ListItem, ListItemText, Collapse, ListItemSecondaryAction, Button, Divider } from "@material-ui/core";
import { withSnackbar } from "notistack";
import { withRouter } from "react-router";
import { getSurveyById } from "../../../requests/surveys";
import { getProfile } from "../../../requests/users";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ArrowBack from "@material-ui/icons/ArrowBack";

class SurveyResults extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            survey: null,
            questions: [],
            allOpen: false
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
                        <Button onClick={this.onGoBack} style={{ marginBottom: 25 }} startIcon={<ArrowBack />}>Vissza a kérdőívekhez</Button>
                        <List
                            component="nav"
                            subheader={
                                <ListSubheader style={{ background: '#00b0ff', borderRadius: 7, height: 45 }} component="div" id="nested-list-subheader">
                                    <Typography variant="h6" style={{ color: '#001721', display: 'inline-block' }}>Kérdések</Typography>
                                    {/*<ListItemSecondaryAction>
                                        <Button style={{ color: '#001721' }} onClick={this.handleOpenAll}>{this.state.allOpen ? "Összes összecsukása" : "Összes kinyitása"}</Button>
                                    </ListItemSecondaryAction>*/}
                                </ListSubheader>
                            }
                        >
                            {this.state.questions.map((question, i = 0) => {
                                i++;
                                return <ResultItem question={question} index={i} open={this.state.allOpen} />
                            })}

                        </List>
                    </Paper>
                    : <Backdrop open={true}><CircularProgress /></Backdrop>}
            </Container>
        )
    }

    onGoBack = () => {
        this.props.history.push('/surveys');
    }

    // Összes kérdés lenyitása/összecsukása
    /*handleOpenAll = () => {
        this.setState({ allOpen: !this.state.allOpen });
    }*/

    getSurvey = () => {
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
                    // Leellenőrizzük, hogy a kérdőív a felhasználó sajátja-e
                    if (!data.own) {
                        this.props.enqueueSnackbar("Nincs jogosultságod a kérdőívhez!", { variant: "error" });
                        this.props.history.replace("/surveys");
                    }
                    this.setState({ survey: data.survey, questions: data.questions, loading: false });
                }
            }).catch(error => { this.props.history.replace("/home") })
        }).catch(error => { });
    }
}

const WithSnackBarSurveyResults = withSnackbar(SurveyResults);
export default withRouter(WithSnackBarSurveyResults);

// Kérdés lista elem
function ResultItem(props) {
    const [open, setOpen] = useState(false);
    const [yesCount, setYesCount] = useState(0);
    const [noCount, setNoCount] = useState(0);
    const [rendered, setRendered] = useState(false);
    const question = props.question;

    // Checkbox típusú kérdés esetén első rendereléskor
    // megszámoljuk az igenek és nemek számát.
    if (question.type === "checkbox" && !rendered) {
        let _noCount = 0;
        let _yesCount = 0;
        for (let answer of question.usrAnswers) {
            if (answer.answer === "checked") _yesCount++;
            if (answer.answer === "unchecked") _noCount++;
        }
        setYesCount(_yesCount);
        setNoCount(_noCount);
        setRendered(true);
    }

    // Kérdés típus szép szöveggé alakítva
    const type = () => {
        if (question.type === "simple_text") return "Egysoros szöveg";
        if (question.type === "multiline_text") return "Többsoros szöveg";
        if (question.type === "choice") return "Feleletválasztó";
        if (question.type === "checkbox") return "Jelölőnégyzet";
        if (question.type === "points_1-5") return "Pontozás (1-5)";
        if (question.type === "points_1-10") return "Pontozás (1-10)";
    }

    // Egy kérdés lenyitása/visszacsukása
    const handleClick = () => {
        setOpen(!open);
    }

    return (
        <React.Fragment>
            <ListItem button onClick={handleClick}>
                <ListItemText primary={`${props.index}. ${question.question}`} secondary={`Típus: ${type()}`} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding style={{ paddingLeft: 20 }}>

                    {question.type === "choice" ?
                        question.answers.map(answer => {
                            let count = 0;
                            // Megszámoljuk, hogy feleletválasztós kérdésnél az egyes
                            // válaszlehetőségeket hányan jelölték be.
                            for (let usrAnswer of question.usrAnswers) {
                                if (usrAnswer.answer === answer.answer) count++;
                            }
                            return (
                                <ListItem button>
                                    <ListItemText primary={answer.answer} secondary={`${count} db`} />
                                </ListItem>
                            )
                        })
                        : ""}

                    {question.type === "simple_text" || question.type === "multiline_text" ?
                        question.usrAnswers.map(answer => {
                            return (
                                <ListItem button>
                                    <ListItemText primary={answer.answer} />
                                </ListItem>
                            )
                        })
                        : ""}

                    {question.type === "checkbox" ?
                        <React.Fragment>
                            <ListItem button>
                                <ListItemText primary="Igen" secondary={`${yesCount} db`} />
                            </ListItem>
                            <ListItem button>
                                <ListItemText primary="Nem" secondary={`${noCount} db`} />
                            </ListItem>
                        </React.Fragment>
                        : ""}

                    {question.type === "points_1-5" ?
                        Array.from(Array(5)).map((x, index) => {
                            let count = 0;
                            // Szintén megszámoljuk, hogy pontozós kérdés esetében az egyes
                            // pontszámokat hányan jelölték be.
                            for (let answer of question.usrAnswers) {
                                if ((index + 1).toString() === answer.answer) count++;
                            }
                            return (
                                <ListItem button>
                                    <ListItemText primary={`${index + 1} pont`} secondary={`${count} db`} />
                                </ListItem>
                            )
                        })
                        : ""}

                    {question.type === "points_1-10" ?
                        Array.from(Array(10)).map((x, index) => {
                            let count = 0;
                            // Szintén megszámoljuk, hogy pontozós kérdés esetében az egyes
                            // pontszámokat hányan jelölték be.
                            for (let answer of question.usrAnswers) {
                                if ((index + 1).toString() === answer.answer) count++;
                            }
                            return (
                                <ListItem button>
                                    <ListItemText primary={`${index + 1} pont`} secondary={`${count} db`} />
                                </ListItem>
                            )
                        })
                        : ""}
                </List>
            </Collapse>
            <Divider />
        </React.Fragment>
    )
}