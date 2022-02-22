import { Backdrop, CircularProgress } from "@material-ui/core";
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { verifyEmail } from "../../requests/auth";

const Confirm = (props) => {
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);

    if (props.match.path === "/confirm/:code/:id") {
        const code = props.match.params.code;
        const id = props.match.params.id;
        verifyEmail(code, id).then(response => {
            if (response.status === 200) {
                setVerified(true);
            }
        }).catch(error => {
            setError(true);
        });
    }

    if (verified) {
        return (
            <Redirect to={{
                pathname: "/login",
                state: { alert: true, alertMsg: "Email cím sikeresen aktiválva!" }
            }} />
        );
    } else if (error) {
        return (<h3>Hiba történt!</h3>);
    } else {
        return (<Backdrop open={true}><CircularProgress /></Backdrop>);
    }
};

export default Confirm;