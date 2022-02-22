import React from 'react';
import { withRouter } from 'react-router';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme, Tooltip, AppBar, Toolbar, CssBaseline, useScrollTrigger, Slide, IconButton, Button } from '@material-ui/core';
import PropTypes from 'prop-types';
import Brightness4 from '@material-ui/icons/Brightness4';
import Brightness7 from '@material-ui/icons/Brightness7';
import Alert from '@material-ui/lab/Alert';
import { withSnackbar } from 'notistack';
import AuthMenu from './AuthMenu';
import { resendEmail } from '../../requests/auth';
import { getIncRequests, getProfile } from '../../requests/users';
import MenuIcon from '@material-ui/icons/Menu';
import logo from '../../assets/logo.png';
import { getUnreadMessages } from '../../requests/messages';
import DrawerMenu from './DrawerMenu';

import './Layout.scss';


class Layout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            themeType: 'dark',
            user: null,
            drawerOpen: false,
            loggedIn: false,
            requests: [],
            unreadChats: [],
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.checkTheme();
            this.whoAmI();
        }

        if (this.props.updated !== prevProps.updated) {
            this.getUnreadChats();
            this.whoAmI();
        }

        if (this.props.requestsUpdated !== prevProps.requestsUpdated) {
            this.whoAmI();
        }
    }

    componentDidMount() {
        this.checkTheme();
        this.whoAmI();
        this.getUnreadChats();
    }

    render() {
        const theme = createTheme({
            palette: {
                type: this.state.themeType,
                primary: {
                    main: '#00b0ff',
                },
                secondary: {
                    main: '#1976d2',
                },
                status: {
                    error: '#f44336'
                }
            },
        });
        return (
            <ThemeProvider theme={theme}>

                <React.Fragment>
                    {this.state.user ?
                        <DrawerMenu open={this.state.drawerOpen} user={this.state.user} toggleDrawer={this.toggleDrawer} onClose={this.toggleDrawer} />
                        : null
                    }
                    <CssBaseline />
                    <HideOnScroll {...this.props}>
                        <AppBar>
                            <Toolbar>

                                {this.state.user ?
                                    <IconButton edge="start" style={{ color: '#001721' }} onClick={this.toggleDrawer}>
                                        <MenuIcon />
                                    </IconButton>
                                    : ''
                                }

                                <img src={logo} className='logo' alt="KoE Logo" />

                                <div style={{ flexGrow: 1, textAlign: 'right' }}>

                                    {
                                        this.state.user ?
                                            <AuthMenu user={this.state.user} requests={this.state.requests} update={this.props.update} unreadChats={this.state.unreadChats} getUnreadChats={this.getUnreadChats} logout={this.logout} /> : ''
                                    }

                                    <IconButton
                                        aria-label="Váltás témák között"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        color="inherit"
                                        onClick={() => this.toggleTheme()}
                                    >
                                        {
                                            this.state.themeType === 'dark' ?
                                                <Tooltip title="Sötét mód ki"><Brightness7 /></Tooltip> :
                                                <Tooltip title="Sötét mód be"><Brightness4 /></Tooltip>
                                        }
                                    </IconButton>
                                </div>
                            </Toolbar>
                        </AppBar>
                    </HideOnScroll>
                    <Toolbar />
                </React.Fragment>

                {(this.state.user && this.state.user.status === 'pending') ?
                // Ha a felhasználói fiók nincs aktiválva, akkor erről egy értesítő üzenet megjelenítése
                    <Alert style={{ display: "flex", justifyContent: "center" }} severity="warning" action={<Button onClick={() => this.onResendClick()}>Email újraküldése</Button>}>Az email címed nincs aktiválva, egyes tartalmakhoz nem lesz hozzáférésed!</Alert>
                    : ''
                }
                {this.props.children}

            </ThemeProvider>
        )
    }

    // Bal oldali menü kinyitás/becsukás
    toggleDrawer = () => {
        if (this.state.drawerOpen) {
            this.setState({ drawerOpen: false });
        } else {
            this.setState({ drawerOpen: true });
        }
    }

    onResendClick = () => {
        const accessToken = localStorage.getItem("accessToken");
        resendEmail(accessToken).then(response => {
            this.props.enqueueSnackbar('Email sikeresen újraküldve!', { variant: "success" });
        }).catch(error => {
            this.props.enqueueSnackbar("Email újraküldése sikertelen!", { variant: "error" });
        })
    }

    toggleTheme = () => {
        if (this.state.themeType === 'dark') {
            localStorage.setItem("themeType", "light");
            this.setState({ themeType: 'light' });
        } else {
            localStorage.setItem("themeType", "dark");
            this.setState({ themeType: 'dark' });
        }
    }

    // Preferált téma ellenőrzése, ha volt már az alkalmazáson belül beállítva,
    // akkor azt kiolvassa a böngésző tárolójából, ha pedig nem, akkor az
    // eszköz beállítását veszi figyelembe.
    checkTheme = () => {
        const themeType = localStorage.getItem("themeType")
        if (themeType) {
            this.setState({ themeType: themeType });
        }
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setState({ themeType: 'dark' });
            localStorage.setItem("themeType", "dark");
        } else {
            this.setState({ themeType: 'light' });
            localStorage.setItem("themeType", 'light');
        }
    }

    getUnreadChats = () => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            getUnreadMessages(token).then(response => {
                if (response.status === 200) {
                    this.setState({ unreadChats: response.data });
                }
            }).catch(error => { });
        }
    }

    logout = () => {
        this.setState({user: null});
    }

    whoAmI = () => {
        const accessToken = localStorage.getItem("accessToken");
        const id = localStorage.getItem("userId");
        if (accessToken && id) {
            getProfile(accessToken, id).then(response => {
                if (response.status === 200) {
                    let user = response.data.user;
                    user.name = user.lastName + " " + user.firstName;
                    user.shortName = user.lastName[0] + user.firstName[0];
                    this.setState({ user: user, loggedIn: true });
                }
            }).catch(error => { }).then(() => {
                if (this.state.loggedIn) {
                    getIncRequests(accessToken).then(response => {
                        if (response.status === 200) {
                            this.setState({ requests: response.data });
                        }
                    }).catch(error => {
                     });
                }
            }
            )
        }
    }
}

const WithSnackBarLayout = withSnackbar(Layout);
export default withRouter(WithSnackBarLayout);

function HideOnScroll(props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({ target: window ? window() : undefined });
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

HideOnScroll.propTypes = {
    children: PropTypes.element.isRequired,
    window: PropTypes.func,
};

