import React, { useState } from 'react';
import { Link, useHistory, withRouter } from 'react-router-dom';
import { Container, Typography, Avatar, CssBaseline, TextField, Button, Paper, Snackbar, InputAdornment, IconButton } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { login } from '../../requests/auth';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import './Login.scss';

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            successLogin: false,
            loginError: false,
            alertOpen: false,
            alertMsg: "",
        }
    }

    componentDidMount() {
        if (this.props.location.state) {
            this.setState({ alertOpen: true, alertMsg: this.props.location.state.alertMsg });
            setTimeout(() => {
                this.setState({ alertOpen: false, alertMsg: "" });
            }, 6000)
        }
    }

    render() {
        return (
            <Container className="content" component="main" maxWidth="xs">
                <CssBaseline />
                {/* Lebegő értesítés megjelenítése, regisztráció/felhasználói fiók aktiválás után. */}
                <Snackbar open={this.state.alertOpen} onClose={this.onAlertClose} key={"top" + "center"} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                    <Alert severity="success" onClose={this.onAlertClose}>
                        {this.state.alertMsg}
                    </Alert>
                </Snackbar>

                <Paper elevation={3} className="paper">

                    <Container className="header">
                        <Avatar className="avatar">
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Bejelentkezés
                        </Typography>
                    </Container>

                    <LoginForm />

                    <Container className="link">
                        <Link className="link" to="/register" variant="body2">
                            {"Nincs még fiókod? Regisztráció"}
                        </Link>
                    </Container>

                </Paper>
            </Container>
        )
    }

    onAlertClose = () => {
        this.setState({ alertOpen: false, alertMsg: "" });
    }
}

export default withRouter(Login);

function LoginForm(props) {
    const history = useHistory();

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [emailMsg, setEmailMsg] = useState("");

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState("");

    const [loginError, setLoginError] = useState(false);

    // Jelszó mező láthatóságának állításához
    const [passFieldType, setPassFieldType] = useState("password");

    const handleChange = event => {
        const name = event.target.name;
        if (name === "email") {
            setEmail(event.target.value);
            setEmailError(false);
            setEmailMsg("");
        }
        if (name === "password") {
            setPassword(event.target.value);
            setPasswordError(false);
            setPasswordMsg("");
        }
        setLoginError(false);
    }

    const loginUser = () => {
        const _email = email.trim();
        const _password = password.trim();

        if (_email !== "" && _password !== "") {
            const data = {
                email: _email,
                password: _password
            }
            login(data).then(response => {
                if (response.status === 200) {
                    const data = response.data;
                    localStorage.setItem("userId", data.id);
                    localStorage.setItem("accessToken", data.accessToken);
                    history.replace("/home");
                }
            }).catch(err => {
                setLoginError(true);
            })
        } else {
            if (_email === "") {
                setEmailError(true);
                setEmailMsg("Nem adtál meg email címet!");
            }
            if (_password === "") {
                setPasswordError(true);
                setPasswordMsg("Nem adtál meg jelszót!");
            }
        }
    }

    const handleKeyPress = event => {
        if (event.key === "Enter") {
            loginUser();
        }
    }

    const revealPassword = () => {
        setPassFieldType("text");
    }

    const hidePassword = () => {
        setPassFieldType("password");
    }

    return (
        <React.Fragment>
            <TextField
                error={emailError}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email cím"
                name="email"
                onChange={handleChange}
                helperText={emailMsg}
                value={email}
            />
            <TextField
                error={passwordError}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Jelszó"
                type={passFieldType}
                id="password"
                onChange={handleChange}
                helperText={passwordMsg}
                value={password}
                onKeyPress={handleKeyPress}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onMouseDown={revealPassword} onMouseUp={hidePassword} onMouseLeave={hidePassword}>
                                <VisibilityOutlinedIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            {loginError ?
                <Alert severity="error">Hibás felhasználónév vagy jelszó!</Alert>
                : ''
            }

            <Button
                fullWidth
                variant="contained"
                color="primary"
                className="submit"
                onClick={loginUser}
            >
                Bejelentkezés
            </Button>
        </React.Fragment>
    )
}