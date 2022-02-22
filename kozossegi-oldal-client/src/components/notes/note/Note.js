import React, { useState } from "react";
import { Container, Divider, Grid, Paper, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, Tooltip, IconButton, TextField, Button, Backdrop, CircularProgress, Menu, MenuItem } from "@material-ui/core";
import AttachmentIcon from '@material-ui/icons/Attachment';
import GetAppIcon from '@material-ui/icons/GetApp';
import CategoryIcon from '@material-ui/icons/Category';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import DateRangeIcon from '@material-ui/icons/DateRange';
import { commentOnNote, dislikeNote, getNoteById, likeNote, deleteComment } from "../../../requests/notes";
import { getProfile } from '../../../requests/users';
import { BASE_URL } from "../../../config/api.config";
import moment from 'moment';
import 'moment/locale/hu';
import { saveAs } from "file-saver";
import SendIcon from '@material-ui/icons/Send';
import { useHistory, withRouter } from "react-router";
import { withSnackbar } from 'notistack';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CreateIcon from '@material-ui/icons/Create';
import { UpdateNoteDialog } from "../NoteFormDialog";
import DeleteIcon from '@material-ui/icons/Delete';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

class Note extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            data: null,
            user: null,
            liked: false,
            anchorEl: null,
            openModifyMenu: false,
            openModifyDialog: false,
            active: false,
            mounted: true,
            error: false
        }
    }

    componentDidCatch() {
        this.props.history.push("/notes");
    }

    componentDidMount() {
        this.getNote();
    }

    render() {
        return (
            <Container>
                {!this.state.loading ?
                    <React.Fragment>
                        <Paper elevation={4} style={{ padding: 25 }}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} style={{ marginBottom: 10 }}>
                                    <Button onClick={this.onNotes} startIcon={<ArrowBackIcon />}>Jegyzetek</Button>
                                </Grid>

                                <Grid item xs={12} sm={6} style={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="h4">
                                        {this.state.data.note.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} style={{ textAlign: 'end' }}>
                                    <Tooltip title={this.state.liked ? "Kedvelés visszavonása" : "Kedvelés"} placement="left">
                                        <IconButton disabled={!this.state.active}>
                                            {this.state.liked ?
                                                <FavoriteIcon onClick={() => this.onFavorite(false)} fontSize="large" />
                                                :
                                                <FavoriteBorderIcon onClick={() => this.onFavorite(true)} fontSize="large" />
                                            }
                                        </IconButton>
                                    </Tooltip>

                                    <Typography variant="body1" style={{ display: 'inline-block', verticalAlign: 'middle' }}>{`(${this.state.data.note.likers.length})`}</Typography>

                                    {(this.state.user.id === this.state.data.note.user.id) && this.state.active ?
                                        <React.Fragment>
                                            <IconButton onClick={this.handleModifyMenu}>
                                                <MoreVertIcon />
                                            </IconButton>
                                            <Menu
                                                anchorEl={this.state.anchorEl}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                keepMounted
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={this.state.openModifyMenu}
                                                onClose={this.handleModifyClose}>
                                                <MenuItem onClick={this.handleDialog}>Szerkesztés<CreateIcon style={{ marginLeft: 8 }} /></MenuItem>
                                            </Menu>
                                        </React.Fragment>
                                        : ""
                                    }
                                </Grid>
                                <Grid item xs={12}><Divider /></Grid>

                                <Grid item xs={6}>
                                    <NoteDetails active={this.state.active} data={this.state.data} />
                                </Grid>

                                <Grid item xs={6}>
                                    {this.state.mounted ?
                                        <DocViewer
                                            className='docViewer'
                                            pluginRenderers={DocViewerRenderers}
                                            documents={[{ uri: BASE_URL + this.state.data.note.path }]}
                                            config={{
                                                header: {
                                                    disableHeader: true,
                                                    disableFileName: true,
                                                    retainURLParams: true,
                                                }
                                            }}
                                        />
                                        : ''}
                                </Grid>

                            </Grid>
                        </Paper>

                        <CommentPaper active={this.state.active} data={this.state.data} getData={this.getNote} user={this.state.user} enqueueSnackbar={this.props.enqueueSnackbar} />

                        <UpdateNoteDialog open={this.state.openModifyDialog} note={this.state.data.note} handleClose={this.handleDialogClose} getNotes={this.getNote} enqueueSnackbar={this.props.enqueueSnackbar} />

                    </React.Fragment>
                    : <Backdrop open={true}><CircularProgress /></Backdrop>
                }
            </Container>
        )
    }

    // Szerkesztő ablak megnyitása
    handleDialog = () => {
        this.setState({ anchorEl: null, openModifyMenu: false, openModifyDialog: true, mounted: false });
        setTimeout(() => {
            this.setState({ mounted: true });
        }, 150);
    }

    // Szerkesztő ablak bezárása
    handleDialogClose = () => {
        this.setState({ openModifyDialog: false, mounted: false });
        setTimeout(() => {
            this.setState({ mounted: true });
        }, 150);
    }

    // Szerkesztés gomb megnyomás után felugró menü megnyitása
    handleModifyMenu = event => {
        this.setState({ anchorEl: event.currentTarget, openModifyMenu: true, mounted: false });
        setTimeout(() => {
            this.setState({ mounted: true });
        }, 150);
    }

    // Szerkesztés gomb megnyomás után felugró menü megnyitása
    handleModifyClose = () => {
        this.setState({ anchorEl: null, openModifyMenu: false, mounted: false });
        setTimeout(() => {
            this.setState({ mounted: true });
        }, 150);
    }

    onNotes = () => {
        this.props.history.push("/notes");
    }

    // Kedvelés/visszavonás
    onFavorite = liked => {
        const token = localStorage.getItem("accessToken");
        const id = this.state.data.note.id;
        if (liked) {
            likeNote(token, id).then(response => {
                if (response.status === 200) {
                    this.getNote();
                }
            }).catch(error => {
                console.log(error.response);
            });
        } else {
            dislikeNote(token, id).then(response => {
                if (response.status === 200) {
                    this.getNote();
                }
            }).catch(error => {
                console.log(error.response);
            });
        }
    }

    getNote = () => {
        this.setState({ loading: true });
        const token = localStorage.getItem("accessToken");
        const id = this.props.match.params.id;
        getNoteById(token, id).then(response => {
            if (response.status === 200) {
                this.setState({ data: response.data });
            }
        }).catch(error => {
            this.setState({ error: true });
            this.props.history.replace("/notes");
        }).then(() => {
            this.setState({ loading: true })
            if (token) {
                // Megnézzük, hogy a felhasználó fiókja aktiválva van-e,
                // illetve kedvelte-e már a jegyzetet
                getProfile(token, "own").then(response => {
                    if (response.status === 200) {
                        let user = response.data.user;
                        const active = response.data.active;
                        user.name = user.lastName + " " + user.firstName;
                        user.shortName = user.lastName[0] + user.firstName[0];
                        const likers = this.state.data.note.likers;
                        this.setState({ liked: false });
                        likers.forEach(liker => {
                            if (liker.Note_Likes.userId === user.id) {
                                this.setState({ liked: true });
                            }
                        });
                        this.setState({ user: user, active: active, loading: false });
                    }
                }).catch(error => { });
            }
        });
    }
}
const WithSnackbarNote = withSnackbar(Note);
export default withRouter(WithSnackbarNote);

// Jegyzet adatai
function NoteDetails(props) {
    const note = props.data.note;
    const path = note.path.split("/");
    const file = path[path.length - 1];
    const date = new Date(note.createdAt).toLocaleDateString();

    const saveFile = () => {
        saveAs(BASE_URL + note.path, file);
    }

    return (
        <Grid item xs={12}>
            <List style={{ width: '100%' }}>

                <ListItem>
                    <ListItemAvatar>
                        <Avatar className="detailIcon"></Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography color="textSecondary" variant="body1">
                            Feltöltő:
                        </Typography>
                        <Typography color="textPrimary" variant="body1">
                            {`${note.user.lastName} ${note.user.firstName}`}
                        </Typography>
                    </ListItemText>
                </ListItem>

                <ListItem>
                    <ListItemAvatar>
                        <Avatar className="detailIcon"><CategoryIcon /></Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography color="textSecondary" variant="body1">
                            Kategória:
                        </Typography>
                        <Typography color="textPrimary" variant="body1">
                            {note.category}
                        </Typography>
                    </ListItemText>
                </ListItem>

                <ListItem>
                    <ListItemAvatar>
                        <Avatar className="detailIcon"><DateRangeIcon /></Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography color="textSecondary" variant="body1">
                            Feltöltve:
                        </Typography>
                        <Typography color="textPrimary" variant="body1">
                            {date}
                        </Typography>
                    </ListItemText>
                </ListItem>

                <ListItem>
                    <ListItemAvatar>
                        <Avatar className="detailIcon">
                            <AttachmentIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography color="textSecondary" variant="body1">
                            Fájl:
                        </Typography>
                        <Typography color="textPrimary" variant="body1">
                            {file}
                        </Typography>
                    </ListItemText>
                    <ListItemSecondaryAction>
                        <Button disabled={!props.active} onClick={saveFile} variant="outlined" endIcon={<GetAppIcon />}>Letöltés</Button>
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
            <Divider />
            <Typography variant="h6" style={{ paddingLeft: 15 }}>
                Leírás
            </Typography>
            <Typography variant="body1" style={{ paddingLeft: 35 }}>
                {note.description && note.description !== "" ? note.description : "Nincs leírás..."}
            </Typography>
        </Grid>
    )
}

// Komment szekció
function CommentPaper(props) {
    const history = useHistory();
    const [comment, setComment] = useState("");
    const note = props.data.note;
    const comments = props.data.comments;
    comments.sort((a, b) => a.comment.createdAt < b.comment.createdAt && 1 || -1);
    const user = props.user;
    const avatar = user.avatar ? BASE_URL + user.avatar : "";

    const handleChange = event => {
        setComment(event.target.value);
    }

    const submitComment = () => {
        if (comment !== "") {
            const token = localStorage.getItem("accessToken");
            const data = { text: comment };
            commentOnNote(token, note.id, data).then(response => {
                if (response.status === 200) {
                    props.getData();
                }
            }).catch(error => { })
        }
    }

    const onProfile = (id) => {
        history.push(`/profile/${id}`);
    }

    return (
        <Paper elevation={4} style={{ marginTop: 10, padding: 25 }}>
            <Grid container>

                <Grid item xs={12} sm={1} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar className={user.gender !== "female" ? "commentAvatar" : "commentAvatar_fm"} src={avatar}>{user.shortName}</Avatar>
                </Grid>
                <Grid item xs={12} sm={11}>
                    <TextField fullWidth multiline name="comment" onChange={handleChange} rows={4} variant="outlined" placeholder="Komment írása..." disabled={!props.active}></TextField>
                    <div style={{ textAlign: 'right' }}>
                        <Button disabled={!props.active} onClick={submitComment} endIcon={<SendIcon />}>Elküld</Button>
                    </div>
                </Grid>

                <Grid item xs={12} style={{ marginTop: 20 }}>
                    <Typography variant="h6">
                        {`Kommentek (${comments.length})`}
                    </Typography>
                    {comments.length === 0 ?
                        <Typography variant="body1" style={{ textAlign: 'center' }}>
                            Nincsenek kommentek...
                        </Typography>
                        :
                        <List>
                            {comments.map(comment => {
                                const text = comment.comment.text;
                                const name = `${comment.user.lastName} ${comment.user.firstName}`;
                                const shortName = comment.user.lastName[0] + comment.user.firstName[0];
                                const avatar = comment.user.avatar ? BASE_URL + comment.user.avatar : "";
                                moment.locale("hu");
                                const date = moment(comment.comment.createdAt).fromNow();
                                return (
                                    <React.Fragment>
                                        <ListItem>

                                            <ListItemAvatar class="linkToUser_avatar" onClick={() => onProfile(comment.user.id)}>
                                                <Avatar src={avatar} className={comment.user.gender !== "female" ? "commentAvatar" : "commentAvatar_fm"}>{shortName}</Avatar>
                                            </ListItemAvatar>

                                            <ListItemText
                                                primary={<React.Fragment><span onClick={() => onProfile(comment.user.id)} class="linkToUser">{name}</span><Typography component="span" variant="body2" color="textSecondary">{` - ${date}`}</Typography></React.Fragment>}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"

                                                            color="textPrimary"
                                                        >
                                                            {text}
                                                        </Typography>
                                                    </React.Fragment>} />
                                            {((props.user.id === comment.user.id) && props.active) || props.user.role === 'admin' ?
                                                <CommentDeleteItem getData={props.getData} enqueueSnackbar={props.enqueueSnackbar} comment={comment} />
                                                : ""
                                            }
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                    </React.Fragment>
                                )
                            })}
                        </List>
                    }
                </Grid>

            </Grid>
        </Paper>
    )
}

// Komment törlő felugró menü cucc
function CommentDeleteItem(props) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openMenu, setOpenMenu] = useState(false);

    const handleMenu = event => {
        setAnchorEl(event.currentTarget);
        setOpenMenu(true);
    }

    const handleClose = () => {
        setAnchorEl(null);
        setOpenMenu(false);
    }

    const onDeleteComment = () => {
        const token = localStorage.getItem("accessToken");
        const id = props.comment.comment.id;
        deleteComment(token, id).then(() => { props.getData() })
            .catch(error => {
                props.getData();
                props.enqueueSnackbar("Nem sikerült a komment törlése!", { variant: 'error' });
            })
    }

    return (
        <ListItemSecondaryAction>
            <IconButton onClick={handleMenu}>
                <MoreVertIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={openMenu}
                onClose={handleClose}>
                <MenuItem onClick={onDeleteComment}>Törlés<DeleteIcon style={{ marginLeft: 8 }} /></MenuItem>
            </Menu>
        </ListItemSecondaryAction>
    )
}