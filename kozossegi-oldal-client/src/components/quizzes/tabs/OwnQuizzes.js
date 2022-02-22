import React, { useState } from "react";
import { List, ListItem, ListItemSecondaryAction, ListItemText, Typography, Button, Divider, FormControlLabel, Switch, Slide, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, CircularProgress } from "@material-ui/core";
import Create from "@material-ui/icons/Create";
import Delete from "@material-ui/icons/Delete";
import AddIcon from '@material-ui/icons/Add';
import CreateQuizForm from "../forms/CreateQuizForm";
import UpdateQuizForm from "../forms/UpdateQuizForm";
import { setQuizPublic, setQuizPrivate, deleteQuiz } from '../../../requests/quizzes';

// Saját kvízek lapfül
export default function OwnQuizzes(props) {
    const [openDialog, setOpenDialog] = useState(false);
    const quizzes = props.quizzes;
    quizzes.sort((a, b) => a.createdAt < b.createdAt && 1 || -1);

    const handleClose = () => {
        setOpenDialog(false);
    }

    return (
        <div hidden={props.index !== props.value} style={{ textAlign: 'center', height: '100%' }}>
            <Button onClick={() => setOpenDialog(true)} variant="contained" color="primary" startIcon={<AddIcon />}>Kvíz létrehozása</Button>
            {props.quizzes.length > 0 ?
                <div className="quizzes_div_own">
                    <List>
                        {quizzes.map(quiz => {
                            return <QuizListItem quiz={quiz} enqueueSnackbar={props.enqueueSnackbar} getQuizzes={props.getQuizzes} />
                        })}

                    </List>
                </div>
                :
                <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" style={{ textAlign: 'center', width: '100%' }}>Nincsenek saját kvízek!</Typography>
                </div>
            }
            <CreateQuizForm open={openDialog} handleClose={handleClose} enqueueSnackbar={props.enqueueSnackbar} getQuizzes={props.getQuizzes} />
        </div>
    )
}

// Kvíz adatait tartalmazó lista elem
function QuizListItem(props) {
    const quiz = props.quiz;
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);

    // A kvíz láthatóságának állítása
    const toggleQuizVisibility = event => {
        const token = localStorage.getItem("accessToken");
        if (event.target.checked) {
            setQuizPublic(token, quiz.id).then(response => { 
                props.getQuizzes();
            }).catch(error => { });
        } else {
            setQuizPrivate(token, quiz.id).then(response => { 
                props.getQuizzes();
            }).catch(error => { });
        }
    }

    // Kvíz törlése
    const onDeleteQuiz = () => {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        deleteQuiz(token, quiz.id).then(response => {
            if (response.status === 200) {
                setOpenDialog(false);
                setLoading(false);
                props.getQuizzes();
                props.enqueueSnackbar("Kvíz törölve!", {variant: "success"});
            }
        }).catch(error => {props.enqueueSnackbar("Nem sikerült a kvíz törlése!", {variant: "error"});});
    }

    // Törlés megerősítő ablak bezárása
    const handleClose = () => {
        setOpenDialog(false);
    }

    // Kvíz szerkesztő ablak bezárása
    const handleFormClose = () => {
        setOpenUpdateForm(false);
    }

    return (
        <React.Fragment>
            <ListItem style={{ width: '70%' }}>

                <ListItemText primary="Név:" secondary={quiz.name}></ListItemText>
                <ListItemText primary="Kategória:" secondary={quiz.category}></ListItemText>
                <ListItemText primary="Kérdések:" secondary={quiz.questions.length}></ListItemText>

                <ListItemSecondaryAction>
                    <FormControlLabel
                        control={
                            <Switch
                                name="public"
                                color="primary"
                                checked={quiz.public}
                                onChange={toggleQuizVisibility}
                            />
                        }
                        label="Publikus"
                    />

                    <Button onClick={() => setOpenUpdateForm(true)} style={{ marginRight: 20, marginLeft: 30 }} startIcon={<Create />} variant="outlined">Szerkesztés</Button>
                    <Button onClick={() => setOpenDialog(true)} variant="outlined" startIcon={<Delete />}>Törlés</Button>

                </ListItemSecondaryAction>
            </ListItem>
            <Divider />

            <DeleteDialog open={openDialog} handleClose={handleClose} loading={loading} deleteQuiz={onDeleteQuiz} />

            <UpdateQuizForm open={openUpdateForm} quiz={quiz} handleClose={handleFormClose} enqueueSnackbar={props.enqueueSnackbar} getQuizzes={props.getQuizzes} />

        </React.Fragment>
    )
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Kvíz törlés megerősítő ablak
function DeleteDialog(props) {

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
                    Biztosan törölni szeretnéd a kvízt?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    Mégsem
                </Button>
                <Button onClick={props.deleteQuiz} color="primary">
                    Igen
                </Button>
                {props.loading ?
                    <CircularProgress />
                    : ""}
            </DialogActions>
        </Dialog>
    );
}