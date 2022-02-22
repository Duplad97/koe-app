import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { Container, FormControl, InputLabel, MenuItem, Select, IconButton, Tooltip, TextField, Grid, Divider, Collapse, Button, Dialog, AppBar, Toolbar, Typography, Slide } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Alert from "@material-ui/lab/Alert";
import { updateSurvey } from '../../../requests/surveys';

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

export function UpdateSurveyFormDialog(props) {
    const classes = useStyles();
    const survey = props.survey;
    const [questionsNum, setQuestionsNum] = useState(0);
    const [questionsDOM, setQuestionsDOM] = useState([]); // Renderelendő kérdések
    const [questions, setQuestions] = useState([]); // Kérdés objektumok
    const [name, setName] = useState(survey.name);
    const [category, setCategory] = useState(survey.category);
    const [description, setDescription] = useState(survey.description);
    const [rendered, setRendered] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);

    // Első rendereléskor beállítjuk a DOM-on és az objektum tömbben a kérdéseket
    if (!rendered) {
        setQuestionsDOM((prevState) => {
            const deleteQ = deleteQuestion;
            const updateQ = updateQuestion;
            let _questionsDOM = Array.from(prevState);
            let _questionsNum = questionsNum;
            for (let question of props.questions) {
                _questionsNum++;
                _questionsDOM.push(<Question key={_questionsNum} type={question.q.type} question={question.q.question} posAnswers={question.posAnswers} index={_questionsNum} delete={deleteQ} update={updateQ} />);
            }
            setQuestionsNum(_questionsNum);
            return _questionsDOM;
        });

        setQuestions((prevState) => {
            let _questions = Array.from(prevState);
            let id = 0;
            for (let question of props.questions) {
                id++;
                const obj = {
                    id: id,
                    question: question.q.question,
                    type: question.q.type,
                    answers: question.answers
                };
                _questions.push(obj);
            }
            return _questions;
        });
        setRendered(true);
    }

    // Kérdés törlése a DOM-ból, és az objektumokból
    const deleteQuestion = value => {
        setQuestionsDOM((prevState) => {
            let _questionsDOM = Array.from(prevState);
            _questionsDOM = _questionsDOM.filter(item => item.props.index !== value);
            return _questionsDOM;
        });

        setQuestions((prevState) => {
            let _questions = Array.from(prevState);
            _questions = _questions.filter(item => item.id !== value);
            //console.log(_questions);
            return _questions;
        });
    }

    // Kérdés hozzáadása a DOM-hoz, és az objektumokhoz
    const addNewQuestion = () => {
        let _questionsNum = questionsNum;
        const deleteQ = deleteQuestion;
        const updateQ = updateQuestion;
        _questionsNum++;
        setQuestionsNum(_questionsNum);
        setQuestionsDOM((prevState) => {
            let _questionsDOM = Array.from(prevState);
            _questionsDOM.push(<Question key={_questionsNum} type="simple_text" answers={[""]} question={""} index={_questionsNum} delete={deleteQ} update={updateQ} />);
            return _questionsDOM;
        });

        setQuestions((prevState) => {
            let _questions = Array.from(prevState);
            const obj = {
                id: _questionsNum,
                question: "",
                type: "simple_text",
                answers: []
            };
            _questions.push(obj);
            //console.log(_questions);
            return _questions;
        });
    }

    // Kérdés szerkesztése
    const updateQuestion = (index, data) => {
        setQuestions((prevState) => {
            let _questions = Array.from(prevState);
            let q = _questions.find(item => item.id === index);
            let i = _questions.indexOf(q);
            _questions[i].question = data.question;
            _questions[i].type = data.type;
            _questions[i].answers = data.answers;
            //console.log(_questions);
            return _questions;
        })
    }

    // Kérdőív mentése
    const onSaveSurvey = () => {
        let valid = true;
        let sameName = false;
        // Megnézük, hogy a szükséges mezők ki vannak-e töltve, és legalább egy
        // kérdés hozzá van-e adva a kérdőívhez
        if (name.trim() === "" || category.trim() === "" || questions.length === 0) {
            valid = false;
        }
        for (let question of questions) {
            // Megnézzük, hogy a kérdés mezők ki vannak-e töltve
            if (question.question === "") valid = false;
            if (question.type === "choice") {
                // Megnézzük, hogy feleletválasztós kérdés esetén a válaszlehetőségek
                // ki vannak-e töltve
                for (let answer of question.answers) {
                    if (answer === "") valid = false;
                }
                for (let i = 0; i < question.answers.length; i++) {
                    // És azt is, hogy nincs-e közöttük egyezés
                    if (question.answers[i] !== "") {
                        for (let j = 0; j < question.answers.length; j++) {
                            if (i !== j && question.answers[i].toLowerCase() === question.answers[j].toLowerCase()) {
                                valid = false;
                                sameName = true;
                            }
                        }
                    }
                }
            }
        }
        if (valid) {
            const token = localStorage.getItem("accessToken");
            const data = { name: name, category: category, description: description, questions: questions };
            updateSurvey(token, survey.id, data).then(response => {
                if (response.status === 200) {
                    props.getSurveys();
                    props.enqueueSnackbar("Kérdőív módosítva!", { variant: "success" });
                    onClose(true);
                }
            }).catch(error => {
                const message = error.response.data.message;
                if (message && message === "Name already in use!") {
                    props.enqueueSnackbar("Ez a név már foglalt!", { variant: "error" });
                } else {
                    props.enqueueSnackbar("Nem sikerült a kérdőív módosítása!", { variant: "error" });
                    onClose();
                }
            });
        } else {
            if (name.trim() === "" || category.trim() === "") {
                props.enqueueSnackbar("A név és kategória kitöltése kötelező!", { variant: "error" });
            }
            if (questions.length === 0) {
                props.enqueueSnackbar("Legalább egy kérdést hozzá kell adni a kérdőívhez!", { variant: "error" });
            }
            if (sameName) {
                props.enqueueSnackbar("Feleletválasztós kérdésnél a válaszlehetőségek nem egyezhetnek meg!", { variant: "error" });
            } else {
                props.enqueueSnackbar("A kérdések összes mezőjének kitöltése kötelező!", { variant: "error" });
            }
        }
    }

    const handleChange = event => {
        const name = event.target.name;
        if (name === "name") { setName(event.target.value); }
        if (name === "category") { setCategory(event.target.value); }
        if (name === "description") { setDescription(event.target.value); }
    }

    // Szerkesztő ablak bezárása
    const onClose = (changed) => {
        props.handleClose();
        // Ha változtatás nélkül zárjuk be az ablakot, akkor visszaállítjuk
        // az állapotot az eredetire
        if (!changed) {
            setQuestionsDOM((prevState) => {
                const deleteQ = deleteQuestion;
                const updateQ = updateQuestion;
                let _questionsDOM = []
                let _questionsNum = 0;
                for (let question of props.questions) {
                    _questionsNum++;
                    _questionsDOM.push(<Question key={_questionsNum} type={question.q.type} question={question.q.question} posAnswers={question.posAnswers} index={_questionsNum} delete={deleteQ} update={updateQ} />);
                }
                setQuestionsNum(_questionsNum);
                return _questionsDOM;
            });
            setQuestions((prevState) => {
                let _questions = [];
                let id = 0;
                for (let question of props.questions) {
                    id++;
                    const obj = {
                        id: id,
                        question: question.q.question,
                        type: question.q.type,
                        answers: question.answers
                    };
                    _questions.push(obj);
                }
                return _questions;
            });
            setName(props.survey.name);
            setCategory(props.survey.category);
            setDescription(props.survey.description);
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
                        Kérdőív szerkesztése
                    </Typography>
                    <Button style={{ color: '#001721' }} onClick={onSaveSurvey} startIcon={<SaveIcon />}>Mentés</Button>
                </Toolbar>
            </AppBar>

            <div>
                <Collapse in={openAlert}>
                    <Alert action={<IconButton size="small" onClick={() => setOpenAlert(false)}><CloseIcon fontSize="small" /></IconButton>} severity="warning"><strong>Figyelem!</strong> Kérdőív módosítása esetén az eddigi kitöltések elvesznek!</Alert>
                </Collapse>
            </div>

            <Container style={{ padding: 20, textAlign: 'center' }}>
                <Grid container spacing={5}>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Név" value={name} name="name" onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Kategória" value={category} name="category" onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Leírás (opcionális)" value={description} name="description" onChange={handleChange} variant="outlined" multiline rows={3} fullWidth />
                    </Grid>
                </Grid>

                <Divider style={{ marginBottom: 15, marginTop: 15 }} />

                {questionsDOM}

                <Button variant="outlined" startIcon={<AddIcon />} style={{ textAlign: 'center' }} onClick={addNewQuestion}>Új kérdés</Button>
            </Container>
        </Dialog>
    );
}

// Kérdés szerkesztő konténer
class Question extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            questionType: this.props.type,
            question: this.props.question,
            answers: this.props.posAnswers,
        }
    }

    // Kérdés típusának a változása
    handleChange = event => {
        this.setState({ questionType: event.target.value, question: "", answers: [""] });
        const data = {
            type: event.target.value,
            question: "",
            answers: [""]
        }
        this.props.update(this.props.index, data);
    }

    // Kérdés szövegének változása
    handleQuestionChange = event => {
        this.setState({ question: event.target.value });
        const data = {
            type: this.state.questionType,
            question: event.target.value,
            answers: this.state.answers
        }
        this.props.update(this.props.index, data);
    }

    // Feleletválasztós kérdés válaszlehetőségének változása
    questionWithAnswersChange = data => {
        this.setState({ question: data.question, answers: data.answers });
        const payload = {
            type: data.type,
            question: data.question,
            answers: data.answers
        }
        this.props.update(this.props.index, payload);
    }

    // Kérdés szerkesztése
    updateQuestion = () => {
        const data = {
            type: this.state.questionType,
            question: this.state.question,
            answers: this.state.answers
        }
        //console.log(data);
        this.props.update(this.props.index, data);
    }

    render() {
        return (
            <div className="question">
                <div className="question_content">
                    <div className="question_form">

                        <FormControl>
                            <InputLabel >Kérdés típusa</InputLabel>
                            <Select
                                value={this.state.questionType.replace("_1-5", "").replace("_1-10", "")}
                                onChange={this.handleChange}
                                fullWidth
                            >
                                <MenuItem value={"simple_text"}>Egysoros szöveg</MenuItem>
                                <MenuItem value={"multiline_text"}>Többsoros szöveg</MenuItem>
                                <MenuItem value={"choice"}>Feleletválasztós</MenuItem>
                                <MenuItem value={"points"}>Pontozós</MenuItem>
                                <MenuItem value={"checkbox"}>Jelölőnégyzetes</MenuItem>
                            </Select>
                        </FormControl>

                        {this.state.questionType === "simple_text" ?
                            <TextField variant="outlined" value={this.state.question} onChange={this.handleQuestionChange} className="question_type" label="Kérdés" />

                            : ""}
                        {this.state.questionType === "multiline_text" ?
                            <TextField variant="outlined" value={this.state.question} onChange={this.handleQuestionChange} className="question_type" label="Kérdés" />

                            : ""}

                        {this.state.questionType === "choice" ?
                            <ChoiceQuestion question={this.state.question} answers={this.state.answers} change={this.questionWithAnswersChange} />
                            : ""}

                        {this.state.questionType.includes("points") ?
                            <PointsQuestion type={this.state.questionType} question={this.state.question} change={this.questionWithAnswersChange} />
                            : ""}

                        {this.state.questionType === "checkbox" ?
                            <TextField variant="outlined" value={this.state.question} onChange={this.handleQuestionChange} className="question_type" label="Kérdés" />

                            : ""}
                    </div>
                    <Tooltip title="Törlés" placement="left">
                        <IconButton onClick={() => this.props.delete(this.props.index)} className="question_delete"><DeleteIcon fontSize="large" /></IconButton>
                    </Tooltip>
                </div>
            </div>
        )
    }
}

// Feleletválasztós kérdés
function ChoiceQuestion(props) {
    const [question, setQuestion] = useState(props.question);
    const [answerCount, setAnswerCount] = useState(props.answers.length > 1 ? props.answers.length : 2);
    const [answers, setAnswers] = useState(props.answers.length > 1 ? props.answers : ["", ""]);

    // Kérdés szövegének változása
    const handleQuestionChange = event => {
        setQuestion(event.target.value);
        props.change({ type: "choice", question: event.target.value, answers: answers });
    }

    // Válaszlehetőségek mennyiségének változása
    const handleChange = event => {
        const count = parseInt(event.target.value);
        setAnswerCount(count);
        setAnswers((prevState) => {
            let _answers = Array.from(prevState);
            _answers = [];
            for (let i = 0; i < count; i++) {
                _answers.push("");
            }
            return _answers;
        })
    }

    // Válaszlehetőség változása
    const answerChange = (event, index) => {
        setAnswers((prevState) => {
            let _answers = Array.from(prevState);
            _answers[index] = event.target.value;
            props.change({ type: "choice", question: question, answers: _answers });
            return _answers;
        })
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <TextField variant="outlined" onChange={handleQuestionChange} value={question} className="question_type" label="Kérdés" />
            </Grid>
            <Grid item xs={12}>
                <TextField type="number" variant="outlined" className="question_type" label="Válaszlehetőségek száma (2-8)"
                    value={answerCount}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 2, max: 8 } }} />
            </Grid>

            {answers.map((answer, index) => {
                const _answer = answer.answer ? answer.answer : answer;
                return (
                    <Grid item xs={12}>
                        <TextField variant="outlined" className="question_type" label={`Válasz ${index + 1}`} onChange={event => answerChange(event, index)} value={_answer}
                        />
                    </Grid>)
            })}

        </Grid>
    )
}

// Pontozós kérdés
function PointsQuestion(props) {
    const [questionType, setQuestionType] = useState(props.type);
    const [question, setQuestion] = useState(props.question);
    const answers = [""];

    // Pontozás skálájának változása
    const handleTypeChange = event => {
        setQuestionType(event.target.value);
        props.change({ type: event.target.value, question: question, answers: answers });
    }

    // Kérdés szövegének változása
    const handleQuestionChange = event => {
        setQuestion(event.target.value);
        props.change({ type: questionType, question: event.target.value, answers: answers });
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <TextField variant="outlined" onChange={handleQuestionChange} value={question} className="question_type" label="Kérdés" />

            </Grid>
            <Grid item xs={12}>
                <FormControl>
                    <InputLabel >Skála</InputLabel>
                    <Select
                        value={questionType}
                        fullWidth
                        variant="outlined"
                        className="question_type"
                        onChange={handleTypeChange}
                    >
                        <MenuItem value={"points_1-5"}>1-5</MenuItem>
                        <MenuItem value={"points_1-10"}>1-10</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    )
}