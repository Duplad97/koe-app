import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Save from '@material-ui/icons/Save';
import { Card, CardActions, CardContent, Checkbox, Container, DialogContent, Grid, TextField, Collapse, Button, Dialog, Divider, AppBar, Toolbar, IconButton, Typography, Slide } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import { updateQuiz } from '../../../requests/quizzes';

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

export default function UpdateQuizForm(props) {
    const classes = useStyles();
    const quiz = props.quiz;
    const [name, setName] = useState(quiz.name);
    const [category, setCategory] = useState(quiz.category);
    const [questions, setQuestions] = useState([]);
    const [questionsDOM, setQuestionsDOM] = useState([]);
    const [count, setCount] = useState(0);
    const [rendered, setRendered] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);

    // Első betöltéskor a kvíz adataival fel kell tölteni a
    // szerkesztő ablakot
    if (!rendered) {
        setQuestionsDOM((prevState) => {
            const deleteQ = deleteQuestion;
            const updateQ = updateQuestion;
            let _questionsDOM = [];
            let index = 0;
            for (let question of quiz.questions) {
                index++;
                _questionsDOM.push(<Question question={question} key={index} index={index} delete={deleteQ} update={updateQ} />);
            }
            return _questionsDOM;
        });

        setQuestions(prevState => {
            let _questions = [];
            let index = 0;
            for (let question of quiz.questions) {
                index++;
                let obj = {
                    id: index,
                    question: question.question,
                    ans1: question.ans1,
                    ans2: question.ans2,
                    ans3: question.ans3,
                    ans4: question.ans4,
                    correct: question.correct,
                };
                _questions.push(obj);
            }
            setCount(index);
            return _questions;
        });
        setRendered(true);
    }

    // Kérdés törlése
    const deleteQuestion = index => {
        setQuestionsDOM((prevState) => {
            let _questionsDOM = Array.from(prevState);
            _questionsDOM = _questionsDOM.filter(item => item.props.index !== index);
            return _questionsDOM;
        });

        setQuestions((prevState) => {
            let _questions = Array.from(prevState);
            _questions = _questions.filter(item => item.id !== index);
            return _questions;
        });
    }

    // Kérdés objektum frissítése
    const updateQuestion = (index, data) => {
        setQuestions((prevState) => {
            let _questions = Array.from(prevState);
            let q = _questions.find(item => item.id === index);
            let i = _questions.indexOf(q);
            _questions[i].question = data.question;
            _questions[i].ans1 = data.ans1;
            _questions[i].ans2 = data.ans2;
            _questions[i].ans3 = data.ans3;
            _questions[i].ans4 = data.ans4;
            _questions[i].correct = data.correct ? data.correct : _questions[i].correct;
            //console.log(_questions);
            return _questions;
        })
    }

    // Új kérdés felvétele
    const addNewQuestion = () => {
        const deleteQ = deleteQuestion;
        const updateQ = updateQuestion;
        let _count = count;
        _count++;
        setCount(_count);

        setQuestionsDOM(prevState => {
            let _questionsDOM = Array.from(prevState);
            _questionsDOM.push(<Question key={_count} index={_count} delete={deleteQ} update={updateQ} />);
            return _questionsDOM;
        });

        setQuestions(prevState => {
            let _questions = Array.from(prevState);
            let obj = {
                id: _count,
                question: "",
                ans1: "",
                ans2: "",
                ans3: "",
                ans4: "",
                correct: "",
            };
            _questions.push(obj);
            return _questions;
        });
    }

    const handleChange = event => {
        const name = event.target.name;
        if (name === "name") setName(event.target.value);
        if (name === "category") setCategory(event.target.value);
    }

    // Ablak bezárása
    const onClose = changed => {
        props.handleClose();
        // Ha módosítás nélkül zárjuk be, akkor vissza kell állítani az
        // eredeti állapotot
        if (!changed) {
            setName(quiz.name);
            setCategory(quiz.category);
            setQuestionsDOM((prevState) => {
                const deleteQ = deleteQuestion;
                const updateQ = updateQuestion;
                let _questionsDOM = [];
                let index = 0;
                for (let question of quiz.questions) {
                    index++;
                    _questionsDOM.push(<Question question={question} key={index} index={index} delete={deleteQ} update={updateQ} />);
                }
                return _questionsDOM;
            });

            setQuestions(prevState => {
                let _questions = [];
                let index = 0;
                for (let question of quiz.questions) {
                    index++;
                    let obj = {
                        id: index,
                        question: question.question,
                        ans1: question.ans1,
                        ans2: question.ans2,
                        ans3: question.ans3,
                        ans4: question.ans4,
                        correct: question.correct,
                    };
                    _questions.push(obj);
                }
                setCount(index);
                return _questions;
            });
        }
    }

    // Kvíz mentése
    const onSaveQuiz = () => {
        let valid = true;
        let noCorrect = false;
        let sameAnswer = false;
        if (name.trim() === "" || category.trim() === "" || questions.length === 0) {
            valid = false;
        }
        for (let question of questions) {
            let allFilled = true;
            // Az összes válasz lehetőség ki van-e töltve
            if (question.ans1.trim() === "" || question.ans2.trim() === "" || question.ans3.trim() === "" || question.ans4.trim() === "" || question.question.trim() === "") {
                valid = false;
                allFilled = false;
            }
            if (allFilled) {
                // Ha igen, akkor nem lehet közöttük egyezés
                if (question.ans1.toLowerCase() === question.ans2.toLowerCase() || question.ans1.toLowerCase() === question.ans3.toLowerCase() || question.ans1.toLowerCase() === question.ans4.toLowerCase()) {
                    valid = false;
                    sameAnswer = true;
                }
                if (question.ans2.toLowerCase() === question.ans1.toLowerCase() || question.ans2.toLowerCase() === question.ans3.toLowerCase() || question.ans2.toLowerCase() === question.ans4.toLowerCase()) {
                    valid = false;
                    sameAnswer = true;
                }
                if (question.ans3.toLowerCase() === question.ans1.toLowerCase() || question.ans3.toLowerCase() === question.ans2.toLowerCase() || question.ans3.toLowerCase() === question.ans4.toLowerCase()) {
                    valid = false;
                    sameAnswer = true;
                }
                if (question.ans4.toLowerCase() === question.ans1.toLowerCase() || question.ans4.toLowerCase() === question.ans2.toLowerCase() || question.ans4.toLowerCase() === question.ans3.toLowerCase()) {
                    valid = false;
                    sameAnswer = true;
                }
            }
            // Van-e helyes válasz választva
            if (question.correct.trim() === "" && allFilled) {
                valid = false;
                noCorrect = true;
            }
        }

        if (valid) {
            const token = localStorage.getItem("accessToken");
            const data = {
                name: name,
                category: category,
                questions: questions
            };
            updateQuiz(token, quiz.id, data).then(response => {
                if (response.status === 200) {
                    props.getQuizzes();
                    onClose(true);
                    props.enqueueSnackbar("Kvíz módosítva!", { variant: "success" });
                }
            }).catch(error => {
                const message = error.response.data.message;
                if (message && message === "Name already in use!") {
                    props.enqueueSnackbar("Ez a név már foglalt!", { variant: "error" });
                } else {
                    props.enqueueSnackbar("Nem sikerült a kvíz létrehozása!", { variant: "error" });
                }
            });
        } else {
            if (name.trim() === "" || category.trim() === "") {
                props.enqueueSnackbar("Név és kategória megadása kötelező!", { variant: "error" });
            } if (questions.length === 0) {
                props.enqueueSnackbar("Legalább egy kérdést tartalmaznia kell a kvíznek", { variant: "error" });
            } if (noCorrect) {
                props.enqueueSnackbar("Minden kérdésnél kötelező a helyes válasz megadása!", { variant: "error" });
            } if (sameAnswer) {
                props.enqueueSnackbar("A kérdéseknél nem lehetnek megegyező válaszok!", { variant: "error" });
            } else {
                props.enqueueSnackbar("A kérdések összes mezőjének kitöltése kötelező!", { variant: "error" });
            }
        }
    }

    return (
        <Dialog fullScreen open={props.open} onClose={props.handleClose} TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => onClose(false)} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Kvíz létrehozása
                    </Typography>
                    <Button startIcon={<Save />} color="inherit" onClick={onSaveQuiz}>
                        Mentés
                    </Button>
                </Toolbar>
            </AppBar>

            <div>
                <Collapse in={openAlert}>
                    <Alert action={<IconButton size="small" onClick={() => setOpenAlert(false)}><CloseIcon fontSize="small" /></IconButton>} severity="warning"><strong>Figyelem!</strong> Kvíz módosítása esetén az eddigi eredmények elvesznek!</Alert>
                </Collapse>
            </div>

            <DialogContent>
                <Container style={{ textAlign: 'center', marginTop: 15 }}>
                    <Grid container>
                        <Grid item xs={12} sm={6}>
                            <TextField value={name} name="name" onChange={handleChange} variant="outlined" label="Név" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField value={category} name="category" onChange={handleChange} variant="outlined" label="Kategória" />
                        </Grid>
                    </Grid>
                    <Divider style={{ marginTop: 25 }} />
                    {questionsDOM}
                    <div style={{ marginTop: 30 }}>
                        <Button onClick={addNewQuestion} variant="outlined" startIcon={<Add />}>Új kérdés</Button>
                    </div>
                </Container>
            </DialogContent>
        </Dialog>
    );
}

// Kérdés szerkesztő konténer
function Question(props) {
    const quizQuestion = props.question;
    const [question, setQuestion] = useState(quizQuestion ? quizQuestion.question : "");
    const [a1, setA1] = useState(quizQuestion ? quizQuestion.ans1 : "");
    const [a2, setA2] = useState(quizQuestion ? quizQuestion.ans2 : "");
    const [a3, setA3] = useState(quizQuestion ? quizQuestion.ans3 : "");
    const [a4, setA4] = useState(quizQuestion ? quizQuestion.ans4 : "");
    const [correct, setCorrect] = useState("");
    const [rendered, setRendered] = useState(false);

    // Első betöltéskor beállítjuk a helyes válaszokat
    if (quizQuestion && !rendered) {
        if (quizQuestion.correct === quizQuestion.ans1) setCorrect("a1");
        if (quizQuestion.correct === quizQuestion.ans2) setCorrect("a2");
        if (quizQuestion.correct === quizQuestion.ans3) setCorrect("a3");
        if (quizQuestion.correct === quizQuestion.ans4) setCorrect("a4");
        setRendered(true);
    }

    // Helyes válasz változása
    // Csak akkor tehetünk pipát egy checkbox-ba, ha már a
    // hozzá tartozó kérdés ki van töltve.
    const onCorrectChange = event => {
        const name = event.target.name;
        if (name === "a1") {
            if (event.target.checked && a1 !== "") {
                setCorrect("a1");
                props.update(props.index, { question: question, ans1: a1, ans2: a2, ans3: a3, ans4: a4, correct: a1 });
            }
        }
        if (name === "a2") {
            if (event.target.checked && a2 !== "") {
                setCorrect("a2");
                props.update(props.index, { question: question, ans1: a1, ans2: a2, ans3: a3, ans4: a4, correct: a2 });
            }
        }
        if (name === "a3") {
            if (event.target.checked && a3 !== "") {
                setCorrect("a3");
                props.update(props.index, { question: question, ans1: a1, ans2: a2, ans3: a3, ans4: a4, correct: a3 });
            }
        }
        if (name === "a4") {
            if (event.target.checked && a4 !== "") {
                setCorrect("a4");
                props.update(props.index, { question: question, ans1: a1, ans2: a2, ans3: a3, ans4: a4, correct: a4 });
            }
        }
    }

    const handleChange = event => {
        const name = event.target.name;
        if (name === "question") {
            setQuestion(event.target.value);
            props.update(props.index, { question: event.target.value, ans1: a1, ans2: a2, ans3: a3, ans4: a4 });
        }
        if (name === "ans1") {
            setA1(event.target.value);
            props.update(props.index, { question: question, ans1: event.target.value, ans2: a2, ans3: a3, ans4: a4 });
        }
        if (name === "ans2") {
            setA2(event.target.value);
            props.update(props.index, { question: question, ans1: a1, ans2: event.target.value, ans3: a3, ans4: a4 });
        }
        if (name === "ans3") {
            setA3(event.target.value);
            props.update(props.index, { question: question, ans1: a1, ans2: a2, ans3: event.target.value, ans4: a4 });
        }
        if (name === "ans4") {
            setA4(event.target.value);
            props.update(props.index, { question: question, ans1: a1, ans2: a2, ans3: a3, ans4: event.target.value });
        }
    }

    return (
        <Card style={{ border: '2px solid #00b0ff', marginTop: 30 }} elevation={6}>
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField value={question} onChange={handleChange} name="question" variant="outlined" label="Kérdés" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField value={a1} onChange={handleChange} name="ans1" variant="outlined" label="Válasz 1" />
                        <Checkbox onChange={onCorrectChange} checked={correct === "a1"} name="a1" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField value={a2} onChange={handleChange} name="ans2" variant="outlined" label="Válasz 2" />
                        <Checkbox onChange={onCorrectChange} checked={correct === "a2"} name="a2" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField value={a3} onChange={handleChange} name="ans3" variant="outlined" label="Válasz 3" />
                        <Checkbox onChange={onCorrectChange} checked={correct === "a3"} name="a3" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField value={a4} onChange={handleChange} name="ans4" variant="outlined" label="Válasz 4" />
                        <Checkbox onChange={onCorrectChange} checked={correct === "a4"} name="a4" />
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
                <Button onClick={() => props.delete(props.index)} startIcon={<Delete />}>Törlés</Button>
            </CardActions>
        </Card>
    )
}