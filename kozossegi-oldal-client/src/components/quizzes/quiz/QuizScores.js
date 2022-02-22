import React from "react";
import { withSnackbar } from "notistack";
import { withRouter } from "react-router";
import { getScores } from "../../../requests/quizzes";
import { getProfile } from "../../../requests/users";
import { TableContainer, Table, TableHead, TableRow, TableBody, TableCell, Container, Paper, Backdrop, CircularProgress, Tab, Avatar, Button } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { BASE_URL } from "../../../config/api.config";
import ArrowBack from "@material-ui/icons/ArrowBack";

class QuizScores extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            quiz: null,
            scores: [],
        }
    }

    componentDidMount() {
        this.getData();
    }

    render() {
        return (
            <Container>
                {!this.state.loading ?
                    <Paper elevation={4} style={{ padding: 25, height: '88vh' }}>
                        <Button onClick={this.onGoBack} style={{ marginBottom: 25 }} startIcon={<ArrowBack />}>Vissza a kvízekhez</Button>
                        <ResultsTable scores={this.state.scores} />
                    </Paper>
                    : <Backdrop open={true}><CircularProgress /></Backdrop>
                }
            </Container>
        )
    }

    onGoBack = () => {
        this.props.history.push("/quizzes", { index: 2 });
    }

    getData = () => {
        const token = localStorage.getItem("accessToken");
        getProfile(token, "own").then(response => {
            if (response.status === 200) {
                const user = response.data.user;
                if (user.status === "pending") this.props.history.replace("/home");
            }
        }).then(() => {
            const id = this.props.match.params.id;
            getScores(token, id).then(response => {
                if (response.status === 200) {
                    const data = response.data;
                    this.setState({ quiz: data.quiz, scores: data.scores, loading: false });
                }
            }).catch(error => { console.log(error.response) });
        }).catch(error => { });
    }
}

const WithSnackbarQuizScores = withSnackbar(QuizScores);
export default withRouter(WithSnackbarQuizScores);

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    small: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        marginRight: 7,
        background: "#1a651a",
        color: "#fff"
    },
    small_female: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        marginRight: 7,
        background: "#ff1a8c",
        color: "#fff"
    }
}));

// Kvíz eredmény táblázat
function ResultsTable(props) {
    const classes = useStyles();
    const scores = props.scores;
    scores.sort((a, b) => a.correct < b.correct && 1 || -1);

    return (
        <TableContainer component={Paper} style={{ height: "70vh" }}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Helyezés</TableCell>
                        <TableCell align="center">Felhasználó</TableCell>
                        <TableCell align="center">Összes kérdés</TableCell>
                        <TableCell align="center">Helyes válaszok</TableCell>
                        <TableCell align="center">Eredmény</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {scores.map((score, index = 0) => {
                        index++;
                        const result = (((score.correct / score.full) * 100).toFixed(1)).toString() + "%";
                        const avatar = score.user.avatar ? BASE_URL + score.user.avatar : "";
                        return <TableRow>
                            <TableCell align="center">{index}</TableCell>
                            <TableCell align="center" style={{ display: "flex", justifyContent: 'center', alignItems: 'center' }}>
                                <Avatar className={score.user.gender !== "female" ? classes.small : classes.small_female} src={avatar}>{score.user.shortName}</Avatar>{score.user.name}</TableCell>
                            <TableCell align="center">{score.full}</TableCell>
                            <TableCell align="center">{score.correct}</TableCell>
                            <TableCell align="center">{result}</TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}