import React, { useState } from 'react';
import { Avatar, Button, TextField, InputAdornment, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Divider, Typography } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CloseIcon from '@material-ui/icons/Close';
import { BASE_URL } from '../../../config/api.config';
import { useHistory } from 'react-router';
import { sendRequest } from '../../../requests/users';
import { socket } from '../../../config/notification.config';

export default function ExploreTab(props) {
    const [term, setTerm] = useState("");

    const onKeyUp = e => {
        if (e.key === 'Enter') {
            props.onSearch("explore", e.target.value)
        }
    }

    const onChange = e => {
        setTerm(e.target.value);
        if (e.target.value === "") {
            props.onSearch("explore", e.target.value)
        }
    }

    const onSearch = () => {
        props.onSearch("explore", term);
    }

    const onDeleteTerm = () => {
        setTerm("");
        props.onSearch("explore", "");
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

            {props.explorable.length > 0
                ?
                <List>
                    {props.explorable.map(user => {
                        return <PeopleListItem user={user} whoAmI={props.whoAmI} enqueueSnackbar={props.enqueueSnackbar}/>
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

    const onSendRequest = () => {
        const token = localStorage.getItem("accessToken");
        sendRequest(token, props.user.id).then(response => {
            if (response.status === 200) {
                props.whoAmI();
                props.enqueueSnackbar("Barát felkérés elküldve!", { variant: "success" });

                const userId = localStorage.getItem("userId");
                socket.emit("sendNotifications", { sender: userId, receiver: props.user.id.toString(), type: "friendRequest", message: `Barát felkérést kaptál!` });
            }
        }).catch(() => {
            props.whoAmI();
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
                    <Button onClick={onSendRequest} variant="outlined" startIcon={<PersonAddIcon />}>Barátnak jelölés</Button>
                </ListItemSecondaryAction>
            </ListItem>
            <Divider />
        </div>
    )
}