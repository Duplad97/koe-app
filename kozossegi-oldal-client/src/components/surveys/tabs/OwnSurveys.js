import React, { useState } from "react";
import { Container, Grid, Button, AccordionActions, FormControlLabel, Switch, Slide, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, CircularProgress, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import CreateIcon from '@material-ui/icons/Create';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { useHistory } from 'react-router';
import { deleteSurvey, setSurveyPrivate, setSurveyPublic } from "../../../requests/surveys";
import { UpdateSurveyFormDialog } from "../forms/UpdateSurveyForm";

export default function OwnSurveys(props) {
    const surveys = props.surveys;
    surveys.sort((a, b) => a.survey.createdAt < b.survey.createdAt && 1 || -1);

    return (
        <div hidden={props.value !== props.index}>
            <Container>
                {
                    props.surveys.length > 0 ?
                        surveys.map(survey => {
                            return <SurveyAccordion data={survey} getSurveys={props.getSurveys} enqueueSnackbar={props.enqueueSnackbar} />
                        })
                        : <Typography variant="h6" style={{ textAlign: 'center' }}>Nincsenek saját kérdőívek!</Typography>
                }

            </Container>
        </div>
    )

}

// Kérdőív lenyíló lista elem
function SurveyAccordion(props) {
    const history = useHistory();
    const survey = props.data.survey;
    const [isPublic, setPublic] = useState(survey.public);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const questions = props.data.questions;
    const date = new Date(survey.createdAt).toLocaleDateString();

    const handleSwitchChange = event => {
        const token = localStorage.getItem("accessToken");
        if (event.target.checked) {
            setSurveyPublic(token, survey.id).then(response => {
                if (response.status === 200) {
                    setPublic(true);
                    props.getSurveys();
                }
            }).catch(err => { });
        } else {
            setSurveyPrivate(token, survey.id).then(response => {
                if (response.status === 200) {
                    setPublic(false);
                    props.getSurveys();
                }
            }).catch(err => { });
        }
    }

    // Törlés megerősítő ablak megnyitása
    const handleDialog = () => {
        setOpenDialog(true);
    }

    // Törlés megerősítő ablak bezárása
    const handleDialogClose = () => {
        setOpenDialog(false);
    }

    // Kérdőív szerkesztő ablak megnyitása
    const handleUpdateDialog = () => {
        // Ha publikus a kérdőív, akkor nem lehet szerkeszteni
        if (!isPublic) {
            setOpenUpdateDialog(true);
        } else {
            props.enqueueSnackbar("Publikus kérdőívet nem lehet módosítani!", {variant: 'error'});
        }
    }

    // Kérdőív szerkesztő ablak bezárása
    const handleUpdateClose = () => {
        setOpenUpdateDialog(false);
    }

    // Kérdőív törlése
    const onDeleteSurvey = () => {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        deleteSurvey(token, survey.id).then(response => {
            if (response.status === 200) {
                setOpenDialog(false);
                props.getSurveys();
                props.enqueueSnackbar("Kérdőív törölve!", { variant: "success" });
                setLoading(false);
            }
        }).catch(error => { props.enqueueSnackbar("Nem sikerült a kérdőív törlése!", {variant: "error"});});
    }

    const onResults = () => {
        history.push("/survey/results/" + survey.id);
    }
    return (
        <React.Fragment>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <div className="accordionHeader">
                        <Typography className="accordionHeader_title" color="textPrimary">{survey.name}</Typography>
                        <Typography className="accordionHeader_title" color="textSecondary">Készítve: {date}</Typography>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <DetailsGrid survey={survey} questions={questions} />
                </AccordionDetails>
                <AccordionActions>

                    <FormControlLabel
                        style={{ width: '100%', justifyContent: 'left' }}
                        value="public"
                        control={<Switch color="primary" checked={survey.public} onChange={handleSwitchChange} />}
                        label="Publikus"
                        labelPlacement="start"
                    />

                    <Button onClick={onResults} size="small" variant="text" startIcon={<EqualizerIcon />} style={{ marginRight: 50, width: 250 }}>Eredmények</Button>
                    <Button onClick={handleUpdateDialog} size="small" variant="text" startIcon={<CreateIcon />} style={{width: 250}}>Szerkesztés</Button>
                    <Button onClick={handleDialog} size="small" variant="text" startIcon={<DeleteIcon />} style={{ marginLeft: 50, marginRight: 20, width: 180 }}>Törlés</Button>

                </AccordionActions>
            </Accordion>

            <DeleteDialog open={openDialog} handleClose={handleDialogClose} deleteSurvey={onDeleteSurvey} loading={loading}/>

            <UpdateSurveyFormDialog open={openUpdateDialog} handleClose={handleUpdateClose} survey={survey} questions={questions} getSurveys={props.getSurveys} enqueueSnackbar={props.enqueueSnackbar} />

        </React.Fragment>
    )
}

// Kérdőív lista elem törzsében lévő konténer
function DetailsGrid(props) {
    const survey = props.survey;
    const questions = props.questions;

    return (
        <Grid container>
            <Grid item xs={12} sm={6}>

                <Typography variant="body1" >Kategória: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{survey.category}</Typography></Typography>

                <Typography variant="body1" >Kérdések: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{questions.length}</Typography></Typography>

                <Typography variant="body1" >Kitöltések: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{questions[0].answers.length}</Typography></Typography>

            </Grid>

            <Grid item xs={12} sm={6}>
                <Typography variant="body1" >Leírás: <Typography style={{ display: 'inline-block' }} variant="body2" color="textSecondary">{!survey.description || survey.description === "" ? "Nincs leírás" : survey.description}</Typography></Typography>
            </Grid>
        </Grid>
    )
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Törlés megerősítő ablak
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
                    Biztosan törölni szeretnéd a kérdőívet?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    Mégsem
                </Button>
                <Button onClick={props.deleteSurvey} color="primary">
                    Igen
                </Button>
                {props.loading ?
                    <CircularProgress />
                    : ""}
            </DialogActions>
        </Dialog>
    );
}