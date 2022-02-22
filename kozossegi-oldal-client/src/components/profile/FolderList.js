import { Avatar, List, ListItemAvatar, ListItem, ListItemText } from '@material-ui/core';
import React, { useState } from 'react';
import SchoolIcon from '@material-ui/icons/School';
import CakeIcon from '@material-ui/icons/Cake';
import EmailIcon from '@material-ui/icons/Email';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import moment from 'moment';

import './Profile.scss';

// A felhasználó adatait tartalmazó lista
export default function FolderList(props) {
    const [school, setSchool] = useState("");

    const date = new Date(props.user.birth_date).toLocaleDateString();
    const created = new Date(props.user.createdAt).toLocaleDateString();
    const age = moment().diff(new Date(props.user.birth_date), 'years');

    if (school === "") {
        // A felhasználó iskolájának a hosszú nevének beállítása
        props.schools.forEach(_school => {
            if (_school.short === props.user.school) {
                setSchool(_school.name);
            }
        })
    }

    return (
        <List>
            <ListItem>
                <ListItemAvatar>
                    <Avatar className="detailIcon">
                        <SchoolIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Egyetem" secondary={`${props.user.school} - ${school}`} />
            </ListItem>

            <ListItem>
                <ListItemAvatar>
                    <Avatar className="detailIcon">
                        <EmailIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Email" secondary={props.user.email} />
            </ListItem>

            <ListItem>
                <ListItemAvatar>
                    <Avatar className="detailIcon">
                        <CakeIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Születésnap" secondary={`${date} (${age} éves)`} />
            </ListItem>

            <ListItem>
                <ListItemAvatar>
                    <Avatar className="detailIcon">
                        <EmojiPeopleIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Regisztráció időpontja" secondary={created} />
            </ListItem>
        </List>
    );
}