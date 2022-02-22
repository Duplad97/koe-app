import React from 'react';
import { useHistory, withRouter } from "react-router";
import { withSnackbar } from 'notistack';
import { Button, Container, Grid, Card, CardContent, CardHeader, Divider, Typography, Paper, Backdrop, CircularProgress } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { getQuizById, submitScore } from '../../../requests/quizzes';
import { getProfile } from "../../../requests/users";

import '../Quizzes.scss';

class PlayQuiz extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            quiz: null,
            questionIndex: 0,
            points: 0,
            correct: false,
            wrong: false,
            guessing: false,
            guess: "",
        }
    }

    componentDidMount() {
        this.getQuiz();
    }

    render() {
        return (
            <Paper elevation={3} style={{ width: '90%', margin: 'auto' }}>
                {!this.state.loading ?
                    <React.Fragment>
                        <QuizDetails quiz={this.state.quiz} />

                        <Container className="playQuiz_container">
                            <div style={{ display: 'block' }}>

                                <QuizResults quiz={this.state.quiz} questionIndex={this.state.questionIndex} points={this.state.points} />

                                <QuestionCard quiz={this.state.quiz} questionIndex={this.state.questionIndex} onGuess={this.onGuess} guessing={this.state.guessing} correct={this.state.correct} wrong={this.state.wrong} guess={this.state.guess} />

                                <Grid container style={{ marginTop: 10, padding: 10 }}>
                                    {/*<Grid item xs={12} sm={6} style={{ textAlign: 'left' }}>
                                        <Button onClick={() => this.changeIndex("down")} disabled={this.state.questionIndex === 0} variant="contained" color="primary">Előző</Button>
                </Grid>*/}
                                    <Grid item xs={12} sm={12} style={{ textAlign: 'center' }}>
                                        {this.state.questionIndex + 1 < this.state.quiz.questions.length ?
                                        // Ha nem az utolsó kérdésnél járunk, akkor következő gomb, ellenkező esetben vége gomb
                                            <Button disabled={!this.state.correct && !this.state.wrong} onClick={() => this.changeIndex("up")} variant="contained" color="primary">Következő</Button>

                                            : <Button onClick={this.onSubmitScore} disabled={!this.state.correct && !this.state.wrong} variant="contained" color="primary">Vége</Button>
                                        }
                                    </Grid>
                                </Grid>
                            </div>

                        </Container >
                    </React.Fragment>
                    : <Backdrop open={true}><CircularProgress /></Backdrop>}
            </Paper>
        )
    }

    // Kvíz végeredményének rögzítése
    onSubmitScore = () => {
        const token = localStorage.getItem("accessToken");
        const id = this.state.quiz.id;
        const data = {
            correct: this.state.points,
            full: this.state.quiz.questions.length
        }
        submitScore(token, id, data).then(response => {
            if (response.status === 200) {
                this.props.enqueueSnackbar("Eredmény rögzítve!", { variant: "success" });
                this.props.history.push("/quizzes");
            }
        }).catch(error => { console.log(error.response) });
    }

    // Válaszlehetőségre kattintás, kis késleltetés után az eredmény felfedése
    onGuess = answer => {
        if (!this.state.guessing && !this.state.correct && !this.state.wrong) {
            this.setState({ guessing: true, guess: answer });
            setTimeout(() => {
                if (answer === this.state.quiz.questions[this.state.questionIndex].correct) {
                    let points = this.state.points;
                    points++;
                    this.setState({ guessing: false, correct: true, wrong: false, points: points });
                } else {
                    this.setState({ guessing: false, wrong: true, correct: false });
                }
            }, 900)
        }
    }

    // Kérdések között lépkedés, jelenleg csak a következő kérdésre
    changeIndex = state => {
        /*if (state === "down") {
            let newIndex = this.state.questionIndex;
            newIndex--;
            this.setState({ questionIndex: newIndex, guessing: false, guess: "", correct: false, wrong: false });
        }*/
        if (state === "up") {
            let newIndex = this.state.questionIndex;
            newIndex++;
            this.setState({ questionIndex: newIndex, guessing: false, guess: "", correct: false, wrong: false });
        }
    }

    // Kvíz adatainak kérése
    getQuiz = () => {
        const token = localStorage.getItem("accessToken");
        getProfile(token, "own").then(response => {
            if (response.status === 200) {
                const user = response.data.user;
                if (user.status === "pending") this.props.history.replace("/home");
            }
        }).then(() => {
            const id = this.props.match.params.id;
            getQuizById(token, id).then(response => {
                if (response.status === 200) {
                    this.setState({ quiz: response.data, loading: false });
                }
            }).catch(error => { console.log(error.response) });
        }).catch(error => { });
    }
}

const WithSnackbarPlayQuiz = withSnackbar(PlayQuiz);
export default withRouter(WithSnackbarPlayQuiz);

// Kérdéseket tartalmazó konténer, ahol maga a játék történik
function QuestionCard(props) {
    const quiz = props.quiz;
    const questions = quiz.questions;
    const currQuestion = questions[props.questionIndex];

    const className = () => {
        if (props.guessing) return "guess";
        if (props.correct) return "correct";
        if (props.wrong) return "wrong";
    }

    return (
        <Card elevation={7} style={{ padding: 25, border: '2px solid #00b0ff' }}>
            <CardHeader title={`${props.questionIndex + 1}. ${currQuestion.question}`} style={{ textAlign: 'center' }} />
            <Divider style={{ marginBottom: 20 }} />
            <CardContent>
                <Grid container spacing={6}>

                    <Grid item xs={12} sm={6} className="playQuiz_cardGrid">
                        <Button className={props.guess === currQuestion.ans1 ? className() : ""} onClick={() => props.onGuess(currQuestion.ans1)} fullWidth variant="outlined">{currQuestion.ans1}</Button>
                    </Grid>

                    <Grid item xs={12} sm={6} className="playQuiz_cardGrid">
                        <Button className={props.guess === currQuestion.ans2 ? className() : ""} onClick={() => props.onGuess(currQuestion.ans2)} fullWidth variant="outlined">{currQuestion.ans2}</Button>
                    </Grid>

                    <Grid item xs={12} sm={6} className="playQuiz_cardGrid">
                        <Button className={props.guess === currQuestion.ans3 ? className() : ""} onClick={() => props.onGuess(currQuestion.ans3)} fullWidth variant="outlined">{currQuestion.ans3}</Button>
                    </Grid>

                    <Grid item xs={12} sm={6} className="playQuiz_cardGrid">
                        <Button className={props.guess === currQuestion.ans4 ? className() : ""} onClick={() => props.onGuess(currQuestion.ans4)} fullWidth variant="outlined">{currQuestion.ans4}</Button>
                    </Grid>

                </Grid>
            </CardContent>
        </Card>
    )
}

// A kvíz aktuális eredményei (hanyadik kérdés, pontszám)
function QuizResults(props) {
    const quiz = props.quiz;
    const questions = quiz.questions;
    const points = props.points;
    const index = props.questionIndex;

    return (
        <Grid container style={{ marginBottom: 10 }}>
            <Grid item xs={6}>
                <Typography style={{ textAlign: 'center' }} variant="h6">Kérdés: {index + 1}/{questions.length}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography style={{ textAlign: 'center' }} variant="h6">Pontszám: {points}</Typography>
            </Grid>
        </Grid>
    )
}

// Kvíz fejléce
function QuizDetails(props) {
    const history = useHistory();
    const quiz = props.quiz;
    const user = quiz.user;
    const date = new Date(quiz.createdAt).toLocaleDateString();

    const onGoBack = () => {
        history.push("/quizzes");
    }

    return (
        <Grid container style={{ padding: 25, alignItems: 'center' }}>
            <Grid item xs={12} sm={3}>
                <Button onClick={onGoBack} startIcon={<ArrowBack />}>Vissza a kvízekhez</Button>
            </Grid>
            <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">{quiz.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">Készítő: {user.lastName} {user.firstName}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">Dátum: {date}</Typography>
            </Grid>
        </Grid>
    )
}