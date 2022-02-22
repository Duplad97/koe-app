import React, { useState } from "react";
import { withRouter } from "react-router";
import { withSnackbar } from "notistack";
import { Backdrop, CircularProgress, Container, Paper, Typography, Divider, Grid, TextField, FormControl, Radio, RadioGroup, FormControlLabel, Button, Checkbox, Slide, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions } from "@material-ui/core";
import { getSurveyById, submitAnswers } from "../../../requests/surveys";
import { getProfile } from "../../../requests/users";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Alert from "@material-ui/lab/Alert";

import '../Surveys.scss';

class FillSurvey extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            survey: null,
            questions: [],
            dialogOpen: false,
            answers: [],
            alert: false,
        }
    }

    componentDidMount() {
        this.getSurvey();
    }

    render() {
        const date = this.state.survey ? new Date(this.state.survey.createdAt).toLocaleDateString() : '';
        return (
            <Container>
                {!this.state.loading ?
                    <Paper elevation={4} style={{ padding: 25 }}>

                        <Button onClick={this.handleDialog} startIcon={<ArrowBackIcon />}>Vissza a kérdőívekhez</Button>

                        <Typography style={{ textAlign: "center" }} variant="h4">{this.state.survey.name}</Typography>
                        <Typography style={{ textAlign: "center" }} variant="subtitle1" color="textSecondary">{`Készítette: ${this.state.survey.user.lastName} ${this.state.survey.user.firstName}`}</Typography>
                        <Typography style={{ textAlign: "center" }} variant="subtitle1" color="textSecondary">{`Dátum: ${date}`}</Typography>

                        <Divider style={{ marginBottom: 20, marginTop: 20 }} />

                        <Grid container spacing={4}>
                            {this.state.questions.map((question, i = 0) => {
                                i++
                                return <Question question={question} index={i} handleAnswerChange={this.handleAnswerChange} />
                            })}
                        </Grid>

                        {this.state.alert ? <Alert severity="error">Néhány kérdésre elfelejtettél válaszolni!</Alert> : ""}

                        <div style={{ width: '100%', textAlign: 'center', marginTop: 25 }}>
                            <Button onClick={this.onSubmitAnswers} variant="contained" color="primary">Válaszok elküldése</Button>
                        </div>

                        {/* Visszalépéskor figyelmeztető felugró ablak */}
                        <GoBackDialogSlide open={this.state.dialogOpen} handleClose={this.handleClose} goBack={this.goBack} />

                    </Paper>
                    : <Backdrop open={true}><CircularProgress /></Backdrop>
                }
            </Container>
        )
    }

    // Kérdőívre adott válaszok elküldése
    onSubmitAnswers = () => {
        const answers = this.state.answers;
        let isAllAnswered = true;
        answers.forEach(answer => {
            // Minden kérdés meg van-e válaszolva
            if (answer.answer === "") {
                isAllAnswered = false;
            }
        });
        if (isAllAnswered) {
            const token = localStorage.getItem("accessToken");
            const data = {
                surveyId: this.state.survey.id,
                answers: answers
            };
            submitAnswers(token, data).then(response => {
                if (response.status === 200) {
                    this.props.enqueueSnackbar("Válaszok sikeresen elküldve!", { variant: "success" });
                    this.props.history.replace("/surveys");
                }
            }).catch(error => { console.log(error.response) });
        } else {
            this.setState({ alert: true });
        }
    }

    handleAnswerChange = (id, answer) => {
        let newAnswers = this.state.answers;
        let newAnswer = newAnswers.find(item => item.questionId === id);
        let index = newAnswers.indexOf(newAnswer);
        newAnswers[index].answer = answer;
        //console.log(newAnswers)
        this.setState({ answers: newAnswers, alert: false });
    }

    // Visszalépéskor figyelmeztető ablak megnyitása
    handleDialog = () => {
        this.setState({ dialogOpen: true });
    }

    // Visszalépéskor figyelmeztető ablak bezárása
    handleClose = () => {
        this.setState({ dialogOpen: false });
    }

    goBack = () => {
        this.props.history.replace("/surveys");
    }

    getSurvey = () => {
        const id = this.props.match.params.id;
        const token = localStorage.getItem("accessToken");
        getProfile(token, "own").then(response => {
            if (response.status === 200) {
                const user = response.data.user;
                if (user.status === "pending") this.props.history.replace("/home");
            }
        }).then(() => {
            getSurveyById(token, id).then(response => {
                if (response.status === 200) {
                    const data = response.data;
                    this.setState({ survey: data.survey, questions: data.questions, loading: false });
                    let newAnswers = [];
                    for (let question of data.questions) {
                        // Checkbox tpusú kérdéseknél a default válasz beállítása
                        if (question.type !== "checkbox") {
                            let obj = {
                                questionId: question.id,
                                answer: ""
                            }
                            newAnswers.push(obj);
                        } else {
                            let obj = {
                                questionId: question.id,
                                answer: "unchecked"
                            }
                            newAnswers.push(obj);
                        }
                    }
                    this.setState({ answers: newAnswers });
                }
            }).catch(error => { this.props.history.replace("/home") });
        }).catch(error => { });
    }
}

const FillSurveyWithSnackbar = withSnackbar(FillSurvey);
export default withRouter(FillSurveyWithSnackbar);

// Egy kérdés konténere
function Question(props) {
    const question = props.question;
    const [answer, setAnswer] = useState(question.type === 'checkbox' ? 'unchecked' : "");

    const handleChange = event => {
        const name = event.target.name;
        if (name === "checkbox") {
            if (event.target.checked) {
                setAnswer("checked");
                props.handleAnswerChange(question.id, "checked");
            } else {
                setAnswer("unchecked");
                props.handleAnswerChange(question.id, "unchecked");
            }
        } else {
            setAnswer(event.target.value);
            props.handleAnswerChange(question.id, event.target.value);
        }
    }

    return (
        <Grid item xs={12} className="fillGrid">

            {question.type === 'simple_text' ?
                <React.Fragment>
                    <Grid item xs={12} sm={4} className="questionIndexGrid">
                        <Typography variant="body1">{props.index}. {question.question}</Typography>
                    </Grid>
                    <Grid xs={12} sm={8}>
                        <TextField onChange={handleChange} value={answer} fullWidth variant="outlined" /*label={`${question.question}`}*/ placeholder="Válasz" />
                    </Grid>
                </React.Fragment>
                : null}

            {question.type === 'choice' ?
                <React.Fragment>
                    <Grid item xs={12} sm={4} className="questionIndexGrid">
                        <Typography variant="body1">{props.index}. {question.question}</Typography>
                    </Grid>
                    <Grid xs={12} sm={8}>
                        <FormControl component="fieldset">
                            {/*<FormLabel component="legend">{question.question}</FormLabel>*/}
                            <RadioGroup onChange={handleChange} value={answer} style={{ textAlign: 'center' }} fullWidth >
                                {question.answers.map(answer => {
                                    return <FormControlLabel value={answer.answer} control={<Radio color="primary" />} label={answer.answer} />
                                })}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </React.Fragment>
                : null}

            {question.type === 'multiline_text' ?
                <React.Fragment>
                    <Grid item xs={12} sm={4} className="questionIndexGrid">
                        <Typography variant="body1">{props.index}. {question.question}</Typography>
                    </Grid>
                    <Grid xs={12} sm={8}>
                        <TextField onChange={handleChange} value={answer} fullWidth variant="outlined" multiline rows={3} /*label={`${question.question}`}*/ placeholder="Válasz" />
                    </Grid>
                </React.Fragment>
                : null}

            {question.type === 'points_1-5' ?
                <React.Fragment>
                    <Grid item xs={12} sm={4} className="questionIndexGrid">
                        <Typography variant="body1">{props.index}. {question.question}</Typography>
                    </Grid>
                    <Grid xs={12} sm={8}>
                        <FormControl component="fieldset">
                            {/*<FormLabel component="legend">{question.question}</FormLabel>*/}
                            <RadioGroup onChange={handleChange} value={answer} style={{ textAlign: 'center' }} fullWidth row >
                                {Array.from(Array(5)).map((x, index) => {
                                    return (
                                        <FormControlLabel value={(index + 1).toString()} control={<Radio color="primary" />} label={index + 1} />
                                    )
                                })}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </React.Fragment>
                : null}

            {question.type === 'points_1-10' ?
                <React.Fragment>
                    <Grid item xs={12} sm={4} className="questionIndexGrid">
                        <Typography variant="body1">{props.index}. {question.question}</Typography>
                    </Grid>
                    <Grid xs={12} sm={8}>
                        <FormControl component="fieldset">
                            {/*<FormLabel component="legend">{question.question}</FormLabel>*/}
                            <RadioGroup onChange={handleChange} value={answer} style={{ textAlign: 'center' }} fullWidth row >
                                {Array.from(Array(10)).map((x, index) => {
                                    return (
                                        <FormControlLabel value={(index + 1).toString()} control={<Radio color="primary" />} label={index + 1} />
                                    )
                                })}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </React.Fragment>
                : null}

            {question.type === 'checkbox' ?
                <React.Fragment>
                    <Grid item xs={12} sm={4} className="questionIndexGrid">
                        <Typography variant="body1">{props.index}. {question.question}</Typography>
                    </Grid>
                    <Grid xs={12} sm={8}>
                        <Checkbox name="checkbox" checked={answer === "checked"} onChange={handleChange} color="primary" />
                    </Grid>
                </React.Fragment>
                : null}
        </Grid>
    )
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

// Visszalépéskor figyelmeztető felugró ablak
export function GoBackDialogSlide(props) {
    return (
        <Dialog
            open={props.open}
            TransitionComponent={Transition}
            keepMounted
            onClose={props.handleClose}
        >
            <DialogTitle >{"Figyelmeztetés!"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    A kérdésekre adott válaszaid el fognak veszni! Biztosan visszalépsz?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    Mégsem
                </Button>
                <Button onClick={props.goBack} color="primary">
                    Igen
                </Button>
            </DialogActions>
        </Dialog>
    );
}