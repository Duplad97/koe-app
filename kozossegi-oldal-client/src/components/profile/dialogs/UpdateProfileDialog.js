import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, Grid, Select, FormControl, MenuItem, InputLabel, FormHelperText, RadioGroup, Radio, FormLabel, FormControlLabel, DialogActions, InputAdornment, Tooltip } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { getSchools } from '../../../requests/auth';
import { updateProfile } from '../../../requests/users';
//import { Autocomplete } from '@material-ui/lab';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import validator from "validator";

export default function UpdateProfileDialog(props) {
    const [schools, setSchools] = useState([]);
    const [school, setSchool] = useState(props.user.school);
    const [firstName, setFirstName] = useState(props.user.firstName);
    const [lastName, setLastName] = useState(props.user.lastName);
    const [email, setEmail] = useState(props.user.email);
    const [birth_date, setBirthDate] = useState(props.user.birth_date);
    const [gender, setGender] = useState(props.user.gender);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    ////////////
    const [firstNameError, setFirstNameError] = useState(false);
    const [firstNameMsg, setFirstNameMsg] = useState("");
    const [lastNameError, setLastNameError] = useState(false);
    const [lastNameMsg, setLastNameMsg] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [emailMsg, setEmailMsg] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState("");
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [newPasswordMsg, setNewPasswordMsg] = useState("");
    const [schoolError, setSchoolError] = useState(false);
    const [schoolMsg, setSchoolMsg] = useState("");
    const [birthError, setBirthError] = useState(false);
    const [birthMsg, setBirthMsg] = useState("");

    if (schools.length === 0) {
        getSchools().then(data => {
            setSchools(data);
        })
    } else if (schools.length > 0 && !school) {
        schools.forEach((school, i = 0) => {
            if (school.short === props.user.school) {
                setSchool(school)
            }
            i++;
        });
    }

    const handleClose = changed => {
        if (!changed) {
            setFirstName(props.user.firstName);
            setLastName(props.user.lastName);
            setEmail(props.user.email);
            setGender(props.user.gender);
            setBirthDate(props.user.birth_date);
            /*schools.forEach((school, i = 0) => {
                if (school.short === props.user.school) {
                    setSchool(school)
                }
                i++;
            });*/
            setSchool(props.user.school);
        }
        props.onClose();
        setPassword("");
        setNewPassword("");
        setFirstNameError(false);
        setFirstNameMsg("");
        setLastNameError(false);
        setLastNameMsg("");
        setEmailError(false);
        setEmailMsg("");
        setPasswordError(false);
        setPasswordMsg("");
        setNewPasswordError(false);
        setNewPasswordMsg("");
        setSchoolError(false);
        setSchoolMsg("");
        setBirthError(false);
        setBirthMsg("");
    }

    const hasNumber = myString => {
        return /\d/.test(myString);
    }
    
    const onUpdateProfile = () => {
        const _firstName = firstName.trim();
        const _lastName = lastName.trim();
        const _email = email.trim();
        const _password = password.trim();
        const _newPassword = newPassword.trim();
        const _school = school.trim();
        const _birth_date = birth_date;
        const _gender = gender;

        if (_firstName !== "" && _lastName !== "" && _email !== "" && _password !== "" && _school !== "" && _birth_date !== null) {
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
                const token = localStorage.getItem("accessToken");
                const data = {
                    firstName: _firstName,
                    lastName: _lastName,
                    email: _email,
                    password: _password,
                    newPassword: _newPassword,
                    school: _school,
                    birth_date: _birth_date,
                    gender: _gender
                }
                updateProfile(token, data).then(response => {
                    if (response.status === 200) {
                        props.whoAmI();
                        props.update();
                        handleClose(true);
                        props.enqueueSnackbar("Profil sikeresen módosítva!", { variant: "success" });
                    }
                }).catch(error => {
                    props.whoAmI();
                    props.update();
                    handleClose(false);
                    console.log(error.response)
                    props.enqueueSnackbar("Profil módosítás nem sikerült", { variant: "error" });
                })
            }
        } else {
            if (_lastName === "") {
                setLastNameError(true);
                setLastNameMsg("Vezetéknév megadása kötelező!")
            }
            if (_firstName === "") {
                setFirstNameError(true);
                setFirstNameMsg("Keresztnév megadása kötelező!")
            }
            if (_email === "") {
                setEmailError(true);
                setEmailMsg("Email cím megadása kötelező!")
            }
            if (_password === "") {
                setPasswordError(true);
                setPasswordMsg("Jelszó megadása kötelező!")
            }
            if (_school === "") {
                setSchoolError(true);
                setSchoolMsg("Egyetem megadása kötelező!")
            }
            if (_birth_date === null) {
                setBirthError(true);
                setBirthMsg("Születésnap megadása kötelező!")
            }
        }
    }

    const handleAutocompleteChange = (event, newValue) => {
        if (newValue) {
            setSchool(newValue);
        }
        setSchoolError(false);
        setSchoolMsg("");
    }

    const handleInputChange = (event, newValue) => {
        setSchoolError(false);
        setSchoolMsg("");
    }

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
        if (name === "newPassword") {
            setNewPassword(event.target.value);
            setNewPasswordError(false);
            setNewPasswordMsg("");
        }
        if (name === "school") {
            setSchool(event.target.value);
            setSchoolError(false);
            setSchoolMsg("");
        }
        if (name === "gender") {
            setGender(event.target.value);
        }
    }

    const handleDateChange = date => {
        setBirthDate(date);
        setBirthError(false);
        setBirthMsg("");
    }

    return (
        <Dialog open={props.open} handleClose={props.onClose}>
            <DialogTitle>Profil szerkesztése</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="lastName"
                            variant="outlined"
                            fullWidth
                            id="lastName"
                            label="Vezetéknév"
                            value={lastName}
                            error={lastNameError}
                            helperText={lastNameMsg}
                            onChange={handleChange}
                            disabled={props.user.status === 'pending'}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="firstName"
                            variant="outlined"
                            fullWidth
                            id="firstName"
                            label="Keresztnév"
                            value={firstName}
                            error={firstNameError}
                            helperText={firstNameMsg}
                            onChange={handleChange}
                            disabled={props.user.status === 'pending'}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="email"
                            label="Email cím"
                            name="email"
                            autoComplete="email"
                            value={email}
                            error={emailError}
                            helperText={emailMsg}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Módosítás után aktivációs emailt küldünk az új email címre!">
                                            <InfoOutlinedIcon style={{ cursor: 'default' }} />
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            name="password"
                            label="Jelszó"
                            type="password"
                            id="password"
                            error={passwordError}
                            helperText={passwordMsg}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            name="newPassword"
                            label="Új jelszó"
                            type="password"
                            id="password"
                            error={newPasswordError}
                            helperText={newPasswordMsg}
                            onChange={handleChange}
                            disabled={props.user.status === 'pending'}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        {/*{schools.length > 0 ?
                            <Autocomplete
                                options={schools}
                                getOptionLabel={(option) => option.name}
                                fullWidth
                                value={school}

                                name="school"
                                noOptionsText="Nincs találat"
                                onChange={handleAutocompleteChange}
                                onInputChange={handleInputChange}
                                renderInput={(params) => <TextField value={school} {...params} error={schoolError} helperText={schoolMsg} label="Egyetem" required variant="outlined" />}
                            /> : ""
                        }*/
                        }
                        <FormControl variant="outlined" fullWidth error={schoolError} disabled={props.user.status === 'pending'}>
                            <InputLabel id="select-outlined-label">Egyetem</InputLabel>
                            <Select
                                name="school"
                                labelId="select-outlined-label"
                                id="select-outlined"
                                value={school}
                                label="Egyetem"
                                onChange={handleChange}
                            >
                                {
                                    schools.map(school => {
                                        return <MenuItem value={school.short}>{school.name}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>{schoolMsg}</FormHelperText>
                        </FormControl>

                    </Grid>

                    <Grid item xs={12} style={{ padding: 14, paddingBottom: 0 }}>
                        <FormControl component="fieldset" disabled={props.user.status === 'pending'}>
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
                                name="birthday"
                                format="yyyy/MM/dd"
                                margin="normal"
                                id="date-picker-inline"
                                label="Születésnap"
                                fullWidth
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                                value={birth_date}
                                error={birthError}
                                helperText={birthMsg}
                                onChange={handleDateChange}
                                disabled={props.user.status === 'pending'}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)}>Mégsem</Button>
                <Button onClick={onUpdateProfile}>Mentés</Button>
            </DialogActions>
        </Dialog>
    )
}