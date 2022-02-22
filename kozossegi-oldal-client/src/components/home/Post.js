import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, Avatar, CardActions, CardContent, CardHeader, Card } from '@material-ui/core';
import moment from 'moment/min/moment-with-locales';
import { useHistory } from 'react-router';
import { BASE_URL } from '../../config/api.config';
import { getSurveyById } from '../../requests/surveys';

import "./Home.scss";

const useStyles = makeStyles((theme) => ({
    root: {
        width: 900,
    }
}));

export default function Post(props) {
    const history = useHistory();
    const classes = useStyles();
    const [loaded, setLoaded] = useState(false);
    const [text, setText] = useState("");
    const post = props.post;
    const type = post.type;
    const user = post.user;
    moment.locale("hu");
    const date = moment(post.createdAt).fromNow();
    const avatar = user.avatar ? BASE_URL + user.avatar : "";

    // Ha a "poszt" kérdőív típusú, akkor leellenőrizzük, hogy azt a
    // felhasználó kitöltötte-e már, és annak függvényében állítjuk be
    // a hozzá tartozó gomb szövegét.
    if (!loaded && type === "survey" && props.user.status === "active") {
        const token = localStorage.getItem("accessToken");
        getSurveyById(token, post.survey.id).then(response => {
            if (response.status === 200) {
                const data = response.data;
                const answers = data.questions[0].usrAnswers;
                const userId = localStorage.getItem("userId");
                let isAnswered = false;
                for (let answer of answers) {
                    if (answer.userId === parseInt(userId)) {
                        isAnswered = true;
                    }
                }
                if (isAnswered) setText("Válaszaim megtekintése");
                else setText("Kitöltöm");
                setLoaded(true);
            }
        }).catch(error => { setLoaded(true) });
    }

    // A poszt törzsében megjelenő szöveg típustól függően
    const getType = () => {
        if (type === "note") return "jegyzetet";
        if (type === "survey") return "kérdőívet";
        if (type === "quiz") return "kvízt";
    }

    // A poszt gombjának szövege típustól függően
    const buttonText = () => {
        if (type === "note") return "Megnézem";
        if (type === "survey") return text;
        if (type === "quiz") return "Játszok";
    }

    // Megadjuk, hogy mi történjen a gombra nyomáskor, egyes típusok
    // függvényében.
    const onWatch = () => {
        if (type === "note") {
            history.push("/note/" + post.note.id);
        }
        if (type === "survey") {
            if (text === "Válaszaim megtekintése") history.push("/survey/answers/" + post.survey.id);
            else history.push("/survey/fill/" + post.survey.id);
        }
        if (type === "quiz") {
            history.push("/quiz/play/" + post.quiz.id);
        }
    }

    const onHeader = () => {
        history.push("/profile/" + user.id);
    }

    // Ha a poszt típusa kérdőív vagy kvíz és a felhasználó nincsen aktiválva, akkor
    // rejtve lesz előle.
    if ((type === "survey" || type === "quiz") && props.user.status === "pending") {
        return null;
    } else {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 25 }}>
                <Card className={classes.root}>

                    <CardHeader
                        className="homeCardHeader"
                        onClick={onHeader}
                        avatar={
                            <Avatar src={avatar} className={user.gender !== "female" ? "homeAvatar" : "homeAvatar_female"}>
                                {user.lastName[0]}{user.firstName[0]}
                            </Avatar>
                        }
                        title={`${user.lastName} ${user.firstName}`}
                        subheader={date}
                    />

                    <CardContent>
                        <Typography variant="body2" color="textSecondary" component="p">
                            Új {getType()} töltött fel!
                        </Typography>
                    </CardContent>

                    <CardActions disableSpacing>
                        <Button onClick={onWatch}>{buttonText()}</Button>
                    </CardActions>

                </Card>
            </div>
        );
    }
}
