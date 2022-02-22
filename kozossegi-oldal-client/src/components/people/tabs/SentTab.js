import React, {useState} from 'react';
import { Avatar, Button, TextField, InputAdornment, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Divider, Typography } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import { BASE_URL } from '../../../config/api.config';
import { useHistory } from 'react-router';
import { cancelRequest } from '../../../requests/users';

export default function SentTab(props) {
    const [term, setTerm] = useState("");

    const onKeyUp = e => {
        if (e.key === 'Enter') {
            props.onSearch("sent", e.target.value)
        }
    }

    const onChange = e => {
        setTerm(e.target.value);
        if (e.target.value === "") {
            props.onSearch("sent", e.target.value)
        }
    }

    const onSearch = () => {
        props.onSearch("sent", term);
    }

    const onDeleteTerm = () => {
        setTerm("");
        props.onSearch("sent", "");
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

            {props.sent.length > 0
                ?
                <List>
                    {props.sent.map(user => {
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

    const onProfile = () => {
        history.replace(`/profile/${props.user.id}`);
    }

    // Elküldött felkérés visszavonása
    const onCancelRequest = () => {
        const token = localStorage.getItem("accessToken");
        cancelRequest(token, props.user.id).then(response => {
            if (response.status === 200) {
                props.whoAmI();
                props.enqueueSnackbar("Barát felkérés visszavonva!", { variant: "success" });
            }
        }).catch(error => {
            props.whoAmI();
            props.enqueueSnackbar("Nem sikerült a felkérés visszavonása!", { variant: "error" });
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
                    <Button onClick={onCancelRequest} variant="outlined" startIcon={<CloseIcon />}>Visszavonás</Button>
                </ListItemSecondaryAction>
            </ListItem>
            <Divider />
        </div>
    )
}