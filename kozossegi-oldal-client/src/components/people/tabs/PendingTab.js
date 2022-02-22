import React,{useState} from 'react';
import { Avatar, Button, TextField, InputAdornment, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Divider, Typography } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { BASE_URL } from '../../../config/api.config';
import { useHistory } from 'react-router';
import { acceptRequest, declineRequest } from '../../../requests/users';
import { socket } from '../../../config/notification.config';

export default function PendingTab(props) {
    const [term, setTerm] = useState("");

    const onKeyUp = e => {
        if (e.key === 'Enter') {
            props.onSearch("pending", e.target.value)
        }
    }

    const onChange = e => {
        setTerm(e.target.value);
        if (e.target.value === "") {
            props.onSearch("pending", e.target.value)
        }
    }

    const onSearch = () => {
        props.onSearch("pending", term);
    }

    const onDeleteTerm = () => {
        setTerm("");
        props.onSearch("pending", "");
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

            {props.pending.length > 0
                ?
                <List>
                    {props.pending.map(user => {
                        return <PeopleListItem user={user} whoAmI={props.whoAmI} enqueueSnackbar={props.enqueueSnackbar} updateRequests={props.updateRequests} />
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

    const onProfile = () => {
        history.replace(`/profile/${props.user.id}`);
    }

    // Bejövő felkérés elfogadása
    const onAcceptRequest = () => {
        const token = localStorage.getItem("accessToken");
        acceptRequest(token, props.user.id).then(response => {
            if (response.status === 200) {
                props.whoAmI();
                props.updateRequests();
                props.enqueueSnackbar("Barát felkérés elfogadva!", { variant: "success" });

                const userId = localStorage.getItem("userId");
                socket.emit("sendNotifications", { sender: userId, receiver: props.user.id.toString(), type: "requestAccept", message: `Elfogadták a felkérésedet!` });
            }
        }).catch(error => {
            props.whoAmI();
            props.enqueueSnackbar("Nem sikerült a felkérés elfogadása!", { variant: "error" });
        });
    }

    // Bejövő felkérés elutasítása
    const onDeclineRequest = () => {
        const token = localStorage.getItem("accessToken");
        declineRequest(token, props.user.id).then(response => {
            if (response.status === 200) {
                props.whoAmI();
                props.updateRequests();
                props.enqueueSnackbar("Barát felkérés elutasítva!", { variant: "success" });

                const userId = localStorage.getItem("userId");
                socket.emit("sendNotifications", { sender: userId, receiver: props.user.id.toString(), type: "requestDecline", message: `Elutasították a felkérésedet!` });
            }
        }).catch(error => {
            props.whoAmI();
            props.enqueueSnackbar("Nem sikerült a felkérés elutasítása!", { variant: "error" });
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
                    <Button onClick={onAcceptRequest} style={{marginRight: 10}} variant="outlined" startIcon={<CheckIcon />}>Elfogadás</Button>
                    <Button onClick={onDeclineRequest} variant="outlined" startIcon={<CloseIcon />}>Elutasítás</Button>
                </ListItemSecondaryAction>
            </ListItem>
            <Divider />
        </div>
    )
}