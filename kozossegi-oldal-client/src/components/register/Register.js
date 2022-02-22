import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Container, Typography, Avatar, TextField, Button, Grid, Paper, Select, FormControl, MenuItem, InputLabel, FormHelperText, RadioGroup, Radio, FormLabel, FormControlLabel, InputAdornment, Tooltip } from '@material-ui/core';
/*import Alert from '@material-ui/lab/Alert';
import Autocomplete from '@material-ui/lab/Autocomplete';*/
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { getSchools, register } from '../../requests/auth';
import { withSnackbar } from 'notistack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import validator from "validator";

import './Register.scss';

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            schools: [],
            regSuccess: false,
            regError: false,
        }
    }

    componentDidMount() {
        if (this.schools.length === 0) {
            this.schools();
        }
    }

    render() {
        if (this.state.regSuccess) {
            return (
                <Redirect to={{
                    pathname: "/login",
                    state: { alert: true, alertMsg: "Sikeres regisztráció! A megadott email címre küldtünk egy aktiváló linket, aktiválás nélkül egyes tartalmakhoz nem lesz hozzáférésed!" }
                }} />
            )
        }
        else {
            return (
                <Container component="main" maxWidth="xs">
                    <Paper className="register_paper">
                        <Container className="header">
                            <Avatar className="avatar">
                                <LockOutlinedIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                Regisztráció
                            </Typography>
                        </Container>
                        <RegisterForm schools={this.state.schools} handleRegSuccess={this.handleRegSuccess} />
                        <Container className="link">
                            <Link className="link" to="/login" variant="body2">
                                Már van fiókod? Bejelentkezés
                            </Link>
                        </Container>
                    </Paper>
                </Container>
            )
        }
    }

    // Legördülő mezőből választható iskolák listájának kérése
    schools = () => {
        getSchools().then(data => {
            this.setState({ schools: data });
        });
    }

    handleRegSuccess = success => {
        if (success) {
            this.setState({ regSuccess: true });
        } else {
            this.setState({ regSuccess: false });
            this.props.enqueueSnackbar("A regisztráció sikertelen!", { variant: "error" });
        }
    }
}

export default withSnackbar(Register);

// Regisztrációs formja
function RegisterForm(props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [school, setSchool] = useState("");
    const [gender, setGender] = useState("female")
    const [birth_date, setBirthDate] = useState(new Date("1997-09-26"));

    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [schoolError, setSchoolError] = useState(false);
    const [genderError, setGenderError] = useState(false);
    const [birthError, setBirthError] = useState(false);

    const [firstNameMsg, setFirstNameMsg] = useState("");
    const [lastNameMsg, setLastNameMsg] = useState("");
    const [emailMsg, setEmailMsg] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [schoolMsg, setSchoolMsg] = useState("");
    const [genderMsg, setGenderMsg] = useState("female")
    const [birthMsg, setBirthMsg] = useState("");

    /*const handleAutocompleteChange = (event, newValue) => {
        if (newValue) {
            this.setState({ school: newValue.short });
        }
        this.setState({ schoolError: false, schoolErrMsg: "" })
    }

    const handleInputChange = (event, newValue) => {
        this.setState({ schoolError: false, schoolErrMsg: "" });
    }*/

    const handleChange = event => {
        const name = event.target.name;
        if (name === "firstName") {
            setFirstName(event.target.value);
            setFirstNameError(false);
            setFirstNameMsg("");
        }
        if (name === "lastName") {
            setLastName(event.target.value);
            setLastNameError(false);
            setLastNameMsg("");
        }
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
        if (name === "school") {
            setSchool(event.target.value);
            setSchoolError(false);
            setSchoolMsg("");
        }
        if (name === "gender") {
            setGender(event.target.value);
            setGenderError(false);
            setGenderMsg("");
        }
    }

    const handleDateChange = date => {
        setBirthDate(date);
        setBirthError(false);
        setBirthMsg("");
    }

    // Jelszó ellenőrzéshez, hogy van-e benne szám
    const hasNumber = myString => {
        return /\d/.test(myString);
    }

    const onRegister = () => {
        const _firstName = firstName.trim();
        const _lastName = lastName.trim();
        const _email = email.trim();
        const _password = password.trim();
        const _school = school.trim();
        const _birth_date = birth_date;
        const _gender = gender;

        // Megnézzük, hogy egyik mező se legyen üres
        if (_firstName !== "" && _lastName !== "" && _email !== "" && _password !== "" && _school !== "" && _birth_date !== null) {
            // Utána megnézzük a további feltételeket
            if (_password.length < 6 || !hasNumber(_password) || !validator.isEmail(_email)) {
                if (!validator.isEmail(_email)) {
                    setEmailError(true);
                    setEmailMsg("Az email cím formátuma nem megfelelő!");
                } if (_password.length < 6) {
                    setPasswordError(true);
                    setPasswordMsg("A jelszónak legalább 6 karakterből kell állnia!");
                } else if (!hasNumber(_password)) {
                    setPasswordError(true);
                    setPasswordMsg("A jelszónak tartalmaznia kell legalább egy számot!");
                }
            } else {
                const data = {
                    firstName: _firstName,
                    lastName: _lastName,
                    email: _email,
                    password: _password,
                    school: _school,
                    birth_date: _birth_date,
                    gender: _gender
                }
                register(data).then(response => {
                    if (response.status === 200) {
                        props.handleRegSuccess(true);
                    } else {
                        props.handleRegSuccess(false);
                    }
                }).catch(error => {
                    props.handleRegSuccess(false);
                })
            }
        } else {
            if (_lastName === "") {
                setLastNameError(true);
                setLastNameMsg("Vezetéknév megadása kötelező!");
            }
            if (_firstName === "") {
                setFirstNameError(true);
                setFirstNameMsg("Keresztnév megadása kötelező!");
            }
            if (_email === "") {
                setEmailError(true);
                setEmailMsg("Email cím megadása kötelező!");
            }
            if (_password === "") {
                setPasswordError(true);
                setPasswordMsg("Jelszó megadása kötelező!");
            }
            if (_school === "") {
                setSchoolError(true);
                setSchoolMsg("Egyetem megadása kötelező!");
            }
            if (_birth_date === null) {
                setBirthError(true);
                setBirthMsg("Születésnap megadása kötelező!");
            }
        }
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    name="lastName"
                    variant="outlined"
                    required
                    fullWidth
                    id="lastName"
                    label="Vezetéknév"
                    onChange={handleChange}
                    error={lastNameError}
                    helperText={lastNameMsg}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    name="firstName"
                    variant="outlined"
                    required
                    fullWidth
                    id="firstName"
                    label="Keresztnév"
                    onChange={handleChange}
                    error={firstNameError}
                    helperText={firstNameMsg}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    label="Email cím"
                    name="email"
                    autoComplete="email"
                    onChange={handleChange}
                    error={emailError}
                    helperText={emailMsg}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title="Regisztráció után egy aktivációs linket küldünk a megadott email címre!"><InfoOutlinedIcon style={{ cursor: 'default' }} /></Tooltip>
                            </InputAdornment>
                        )
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    label="Jelszó"
                    type="password"
                    id="password"
                    onChange={handleChange}
                    error={passwordError}
                    helperText={passwordMsg}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title="A jelszónak legalább 6 karakterből kell állnia, és tartalmaznia kell minimum egy számot!"><InfoOutlinedIcon style={{ cursor: 'default' }} /></Tooltip>
                            </InputAdornment>
                        )
                    }}
                />
            </Grid>

            <Grid item xs={12}>
                {/*<Autocomplete
            options={this.state.schools}
            getOptionLabel={(option) => option.name}
            fullWidth
            name="school"
            noOptionsText="Nincs találat"
            onChange={this.handleAutocompleteChange}
            onInputChange={this.handleInputChange}
            renderInput={(params) => <TextField value={this.state.school} {...params} error={this.state.schoolError} helperText={this.state.schoolErrMsg} label="Egyetem" required variant="outlined" />}
        />*/
                }
                <FormControl required variant="outlined" fullWidth error={schoolError}>
                    <InputLabel id="select-outlined-label">Egyetem</InputLabel>
                    <Select
                        name="school"
                        labelId="select-outlined-label"
                        id="select-outlined"
                        value={school}
                        onChange={handleChange}
                        label="Egyetem"
                    >
                        {
                            props.schools.map(school => {
                                return <MenuItem value={school.short}>{school.name}</MenuItem>
                            })
                        }
                    </Select>

                    <FormHelperText>{schoolMsg}</FormHelperText>
                </FormControl>

            </Grid>

            <Grid item xs={12} style={{ padding: 14, paddingBottom: 0 }}>
                <FormControl required component="fieldset">
                    <FormLabel component="legend">Nem</FormLabel>
                    <RadioGroup style={{ textAlign: 'center' }} fullWidth row aria-label="gender" name="gender" value={gender} onChange={handleChange}>
                        <FormControlLabel value="female" control={<Radio />} label="Nő" />
                        <FormControlLabel value="male" control={<Radio />} label="Férfi" />
                        <FormControlLabel value="other" control={<Radio />} label="Egyéb" />
                    </RadioGroup>
                </FormControl>
            </Grid>

            <Grid item xs={12} style={{ textAlign: 'center' }}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        required
                        name="birthday"
                        format="yyyy/MM/dd"
                        margin="normal"
                        id="date-picker-inline"
                        label="Születésnap"
                        value={birth_date}
                        onChange={handleDateChange}
                        fullWidth
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        error={birthError}
                        helperText={birthMsg}
                    />
                </MuiPickersUtilsProvider>
            </Grid>

            <Button
                fullWidth
                variant="contained"
                color="primary"
                className="submit"
                onClick={onRegister}
            >
                Regisztráció
            </Button>
        </Grid>
    )
}