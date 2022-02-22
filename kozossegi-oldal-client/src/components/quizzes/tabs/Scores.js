import React from "react";
import { List, ListItem, ListItemText, Typography, Paper, ListItemSecondaryAction, Button } from "@material-ui/core";
import moment from 'moment';
import 'moment/locale/hu';
import { useHistory } from "react-router";

// Saját kvíz eredmények lapfül
export default function Scores(props) {
    const scores = props.scores;
    scores.sort((a, b) => a.score.createdAt < b.score.createdAt && 1 || -1);

    return (
        <div hidden={props.index !== props.value} style={{ height: '100%' }}>
            {props.scores.length > 0 ?
                <List>
                    {scores.map(score => {
                        return <ScoreListItem score={score} />
                    })}
                </List>
                :
                <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" style={{ textAlign: 'center', width: '100%' }}>Nincsenek eredmények!</Typography>
                </div>
            }
        </div>
    )
}

// Kvíz eredmény adatok lista eleme
function ScoreListItem(props) {
    const history = useHistory();
    const score = props.score.score;
    const quiz = props.score.quiz;
    const result = (((score.correct / score.full) * 100).toFixed(1)).toString() + "%";
    moment.locale("hu");
    const date = moment(score.createdAt).fromNow();

    const onResults = () => {
        history.push("/quiz/scores/" + quiz.id);
    }

    return (
        <ListItem>
            <Paper className="scores_list_paper" elevation={4} style={{}}>
                <ListItemText className="scores_list_text" primary={quiz.name} />
                <ListItemText className="scores_list_text" primary={`Kérdések: ${score.full}`} />
                <ListItemText className="scores_list_text" primary={`Helyes válaszok: ${score.correct}`} />
                <ListItemText className="scores_list_text" primary={`Eredmény: ${result}`} />
                <ListItemText className="scores_list_text" secondary={date} />
                <ListItemSecondaryAction style={{ display: "contents" }}>
                    <Button onClick={onResults}>Összes eredmény</Button>
                </ListItemSecondaryAction>
            </Paper>
        </ListItem>
    )
}