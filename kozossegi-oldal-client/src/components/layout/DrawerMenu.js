import { Divider, SwipeableDrawer, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import React from 'react';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import CloseIcon from '@material-ui/icons/Close';
import HomeIcon from '@material-ui/icons/Home';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { withRouter } from 'react-router';

class DrawerMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: ""
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            const path = this.props.location.pathname.replace("/", "");
            this.setState({ selected: path });
        }
    }

    componentDidMount() {
        const path = this.props.location.pathname.replace("/", "");
        this.setState({ selected: path });
    }

    render() {
        return (
            <SwipeableDrawer
                anchor={'left'}
                open={this.props.open}
                onOpen={this.props.toggleDrawer}
                onClose={this.props.toggleDrawer}>

                <List style={{ width: 250 }}>

                    <ListItem button selected={this.state.selected === "home"} onClick={() => this.onListItemClick("home")}>
                        <ListItemIcon><HomeIcon /></ListItemIcon>
                        <ListItemText primary={"Kezdőlap"} />
                    </ListItem>

                    <ListItem button selected={this.state.selected === "notes"} onClick={() => this.onListItemClick("notes")}>
                        <ListItemIcon><LibraryBooksIcon /></ListItemIcon>
                        <ListItemText primary={"Jegyzetek"} />
                    </ListItem>

                    {this.props.user.status === "active" ?
                    //Ha egy felhasználói fiók nem aktív, akkor ezt a két menüpontot nem láthatja.
                        <React.Fragment>
                            <ListItem button selected={this.state.selected === "surveys"} onClick={() => this.onListItemClick("surveys")}>
                                <ListItemIcon><AssessmentIcon /></ListItemIcon>
                                <ListItemText primary={"Kérdőívek"} />
                            </ListItem>

                            <ListItem button selected={this.state.selected === "quizzes"} onClick={() => this.onListItemClick("quizzes")} >
                                <ListItemIcon><ContactSupportIcon /></ListItemIcon>
                                <ListItemText primary={"Kvízek"} />
                            </ListItem>
                        </React.Fragment>
                        : null
                    }

                </List>

                <Divider />

                <List style={{ width: 250 }}>
                    <ListItem button onClick={this.props.toggleDrawer}>
                        <ListItemIcon><CloseIcon /></ListItemIcon>
                        <ListItemText primary={"Bezárás"} />
                    </ListItem>
                </List>
                
            </SwipeableDrawer>
        )
    }

    onListItemClick = (target) => {
        this.setState({ selected: target });
        this.props.toggleDrawer();
        if (target === "home") {
            this.props.history.push("/home");
        }
        if (target === "notes") {
            this.props.history.push("/notes");
        }
        if (target === "surveys") {
            this.props.history.push("/surveys");
        }
        if (target === "quizzes") {
            this.props.history.push("/quizzes");
        }
    }
}

export default withRouter(DrawerMenu);