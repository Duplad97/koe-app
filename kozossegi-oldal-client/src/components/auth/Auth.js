import React from 'react';
import { Redirect, withRouter } from 'react-router';
import { auth } from '../../requests/auth';

class Auth extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            error: false
        }
    }

    componentDidUpdate(prevProps) {
        // Ha megváltozik a path, és az nem a /confirm-ra mutat,
        // akkor ellenőrizzük, hogy továbbra is érvényes-e a
        // felhasználó tokenje.
        if (this.props.location.pathname !== prevProps.location.pathname) {
            if (!this.props.location.pathname.includes("/confirm"))
            this.onAuth();
        }
    }

    componentDidMount() {
        // Első betöltéskor, ha a path nem a /confirm-ra mutat,
        // ellenőrizzük, hogy érvényes-e a felhasználó tokenje.
        if (!this.props.location.pathname.includes("/confirm"))
            this.onAuth();
    }

    render() {
        const path = this.props.location.pathname;
        if (this.state.authenticated) {
            // Ha érvényes tokennel rendelkezik a felhasznló, és a path a regisztrációra,
            // vagy a bejelentkezésre mutatna, akkor helyette a kezdőlapra irányítjuk.
            if (path === "/register" || path === "/login") {
                return (
                    <Redirect to="/home" />
                )
                // Ellenkező esetben pedig azon az oldalon hagyjuk, ahol tartózkodott.
            } else {
                return (
                    <Redirect to={path} />
                )
            }
        } if (this.state.error) {
            if (path === "/register") {
                return (
                    <Redirect to="/register" />
                );
            } else {
                return (
                    <Redirect to="/login" />
                );
            }
        } else return null;
    }

    onAuth = () => {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            auth(accessToken).then(response => {
                if (response.status === 200) {
                    this.setState({
                        authenticated: true,
                        error: false
                    });
                }
            }).catch(error => {
                // Ha az authentikáció során hiba történt, akkor valószínűleg érvénytelen a
                // felhasználó tokenje, ezért ha az el volt tárolva a böngészőben, törlésre
                // kerül.
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userId");
                this.setState({
                    error: true,
                    authenticated: false
                });
                window.location.reload(); // Erre azért van szükség, hogy a Redirect triggerelődjön.
            });
        } else {
            this.setState({ error: true, authenticated: false });
        }
    }
}

export default withRouter(Auth);