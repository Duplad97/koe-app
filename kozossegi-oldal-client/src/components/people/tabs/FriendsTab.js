import React, {useState} from 'react';
import { Avatar, Button, TextField, InputAdornment, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Divider,Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import { BASE_URL } from '../../../config/api.config';
import { useHistory } from 'react-router';
import { deleteFriend } from '../../../requests/users';

export default function FriendsTab(props) {
    const [term, setTerm] = useState("");

    const onKeyUp = e => {
        if (e.key === 'Enter') {
            props.onSearch("friends", e.target.value)
        }
    }

    const onChange = e => {
        setTerm(e.target.value);
        if (e.target.value === "") {
            props.onSearch("friends", e.target.value)
        }
    }

    const onSearch = () => {
        props.onSearch("friends", term);
    }

    const onDeleteTerm = () => {
        setTerm("");
        props.onSearch("friends", "");
    }

    return (
        <div hidden={props.value !== props.index}>
            <TextField
                value={term}
                onKeyUp={onKeyUp}
                onChange={onChange}
                variant="outlined"
                label="Keresés"
                fullWidth
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {term !== "" ?
                                <IconButton onClick={onDeleteTerm}>
                                    <CloseIcon />
                                </IconButton>
                                : ""
                            }
                            <IconButton onClick={onSearch}>
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {props.friends.length > 0
                ?
                <List>
                    {props.friends.map(user => {
                        return <PeopleListItem user={user} whoAmI={props.whoAmI} enqueueSnackbar={props.enqueueSnackbar} />
                    })}

                </List>
                :
                <Typography style={{textAlign: 'center', marginTop: 30}} variant="h5">Nincs találat...</Typography>
            }
        </div>
    )
}

// Felhasználó adatait tartalmazó lista elem
function PeopleListItem(props) {
    const shortName = props.user.lastName[0] + props.user.firstName[0];
    const avatar = props.user.avatar ? BASE_URL + props.user.avatar : "";
    const history = useHistory();
    const [open, setOpen] = useState(false);

    const onProfile = () => {
        history.replace(`/profile/${props.user.id}`);
    }

    // Törlés megerősítő ablak megnyitás
    const handleOpen = () => {
        setOpen(true);
    }

    // Törlés megerősítő ablak bezárás
    const handleClose = () => {
        setOpen(false);
    }

    // Barát törlése
    const onDeleteFriend = () => {
        const token = localStorage.getItem("accessToken");
        deleteFriend(token, props.user.id).then(response => {
            if (response.status === 200) {
                props.whoAmI();
                props.enqueueSnackbar("Barát törölve!", { variant: "success" });
            }
        }).catch(error => {
            props.whoAmI();
            props.enqueueSnackbar("Nem sikerült a törlés!", { variant: "error" });
        });
    }

    return (
        <div>
            <ListItem button onClick={onProfile}>
                <ListItemAvatar>
                    <Avatar className={props.user.gender !== "female" ? "peopleAvatar" : "peopleAvatar_female"} src={avatar}>{shortName}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={`${props.user.lastName} ${props.user.firstName}`} secondary={props.user.school} />
                <ListItemSecondaryAction>
                    <Button onClick={handleOpen} variant="outlined" startIcon={<DeleteIcon />}>Barát törlése</Button>
                </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <AlertDialog open={open} handleClose={handleClose} onDeleteFriend={onDeleteFriend} text={<span>Biztosan törölni szeretnéd <b>{props.user.lastName} {props.user.firstName}</b> felhasználót a barátaid közül?</span>} />
        </div>
    )
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function AlertDialog(props) {
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
                    {props.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    Mégsem
                </Button>
                <Button onClick={props.onDeleteFriend} color="primary">
                    Igen
                </Button>
            </DialogActions>
        </Dialog>
    );
}