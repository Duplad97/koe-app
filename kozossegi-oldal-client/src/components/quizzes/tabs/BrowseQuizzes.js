import React from "react";
import { Avatar, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Typography, Button, Divider } from "@material-ui/core";
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import { BASE_URL } from "../../../config/api.config";
import { useHistory } from "react-router";

// Kvízek böngészése lapfül
export default function BrowseQuizzes(props) {
    const quizzes = props.quizzes;
    quizzes.sort((a, b) => a.createdAt < b.createdAt && 1 || -1);

    return (
        <div hidden={props.index !== props.value} className="quizzes_div">
            {props.quizzes.length > 0 ?
                <List>
                    {quizzes.map(quiz => {
                        return <QuizListItem quiz={quiz} />
                    })}

                </List>
                :
                <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" style={{ textAlign: 'center', width: '100%' }}>Nincsenek kvízek!</Typography>
                </div>
            }
        </div>
    )
}

// Kvíz adatait tartalmazó lista elem
function QuizListItem(props) {
    const history = useHistory();
    const quiz = props.quiz;
    const user = quiz.user;
    const avatar = user.avatar ? BASE_URL + user.avatar : "";
    const date = new Date(quiz.createdAt).toLocaleDateString();

    const onPlayQuiz = () => {
        history.push("/quiz/play/" + quiz.id);
    }

    return (
        <React.Fragment>
            <ListItem style={{ width: '80%' }}>
                <ListItemAvatar>
                    <Avatar className={user.gender !== "female" ? "quizzes_avatar" : "quizzes_avatar_female"} src={avatar}>{user.lastName[0]}{user.firstName[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary="Név:" secondary={quiz.name}></ListItemText>
                <ListItemText primary="Kategória:" secondary={quiz.category}></ListItemText>
                <ListItemText primary="Készítő:" secondary={`${user.lastName} ${user.firstName}`}></ListItemText>
                <ListItemText primary="Dátum:" secondary={date}></ListItemText>
                <ListItemText primary="Kérdések:" secondary={quiz.questions.length}></ListItemText>
                <ListItemSecondaryAction>
                    <Button onClick={onPlayQuiz} variant="outlined" endIcon={<SportsEsportsIcon />}>
                        Kezdés
                    </Button>
                </ListItemSecondaryAction>
            </ListItem>
            <Divider />
        </React.Fragment>
    )
}