import React from "react";
import { Container, Grid, Button, AccordionActions, Avatar, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useHistory } from 'react-router';
import { BASE_URL } from "../../../config/api.config";

export default function NewSurveys(props) {
    const surveys = props.surveys;
    surveys.sort((a, b) => a.survey.createdAt < b.survey.createdAt && 1 || -1);

    return (
        <div hidden={props.value !== props.index}>
            <Container>
                {
                    surveys.length > 0 ?
                        surveys.map(survey => {
                            return <SurveyAccordion data={survey} />
                        })
                        : <Typography variant="h6" style={{ textAlign: 'center' }}>Nincsenek kitöltetlen kérdőívek!</Typography>
                }

            </Container>
        </div>
    )

}

// Kérdőív lenyíló lista elem
function SurveyAccordion(props) {
    const history = useHistory();
    const survey = props.data.survey;
    const user = survey.user;
    const avatar = user.avatar ? BASE_URL + user.avatar : '';
    const date = new Date(survey.createdAt).toLocaleDateString();

    const onFillSurvey = () => {
        history.push("/survey/fill/" + survey.id);
    }

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <div className="accordionHeader">
                    <div className="accordionHeader_container">
                        <Avatar className={user.gender !== "female" ? "accordionHeader_avatar" : "accordionHeader_avatar_female"} src={avatar}>{user.lastName[0] + user.firstName[0]}</Avatar>
                        <Typography className="accordionHeader_name">{`${user.lastName} ${user.firstName}`}</Typography>
                    </div>
                    <Typography className="accordionHeader_title" color="textSecondary">{survey.name}</Typography>
                    <Typography className="accordionHeader_title" color="textSecondary">Készítve: {date}</Typography>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <DetailsGrid survey={survey} />
            </AccordionDetails>
            <AccordionActions>
                <Button size="small" variant="text" onClick={onFillSurvey}>Kitöltöm</Button>
                {/*props.iAm.role === "admin" ? <Button size="small" onClick={onDeleteNote} variant="text">Törlés</Button> : ""
                */}
            </AccordionActions>
        </Accordion>
    )
}

// Kérdőív lista elem törzsében lévő konténer
function DetailsGrid(props) {
    const survey = props.survey;
    return (
        <Grid container>
            <Grid item xs={12} sm={6}>

                <Typography variant="body1" >Kategória: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{survey.category}</Typography></Typography>

                <Typography variant="body1" >Kérdések: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{survey.questions.length}</Typography></Typography>

            </Grid>

            <Grid item xs={12} sm={6}>
                <Typography variant="body1" >Leírás: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{!survey.description || survey.description === "" ? "Nincs leírás" : survey.description}</Typography></Typography>
            </Grid>
        </Grid>
    )
}