import React from 'react';
import { Switch, Route, BrowserRouter as Router, Redirect } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import Home from './components/home/Home';
import Auth from './components/auth/Auth';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Confirm from './components/auth/Confirm';
import Profile from './components/profile/Profile';
import Layout from './components/layout/Layout';
import People from './components/people/People';
import Notes from './components/notes/Notes';
import Note from './components/notes/note/Note';
import Surveys from './components/surveys/Surveys';
import Quizzes from './components/quizzes/Quizzes';
import FillSurvey from './components/surveys/survey/FillSurvey';
import SurveyResults from './components/surveys/survey/SurveyResults';
import AnsweredSurvey from './components/surveys/survey/AnsweredSurvey';
import Messages from './components/messages/Messages';
import PlayQuiz from './components/quizzes/quiz/PlayQuiz';
import QuizScores from './components/quizzes/quiz/QuizScores';

export default class AppRouter extends React.Component {
    constructor(props) {
        super(props);

        this.state ={
            updated: false,
            requestsUpdated: false,
        }
    }

    // A Layout komponensnek így jelezzük, hogy frissülnie kell.
    update = () => {
        this.setState({updated: !this.state.updated});
    }

    // A Layout komponensnek jelezzük, hogy új barátfelkérésünk jött.
    updateRequests = () => {
        this.setState({requestsUpdated: !this.state.requestsUpdated});
    }

    render() {
        return (
            <SnackbarProvider maxSnack={4}>
                <Router>
                    <Auth />
                    <Layout updated={this.state.updated} requestsUpdated={this.state.requestsUpdated} update={this.update} handleThemeTypeChange={this.handleThemeTypeChange}>
                        <Switch>

                            <Route path='/confirm/:code/:id' render={(props) => <Confirm {...props} update={this.update} />}>
                            </Route>

                            <Route path='/login' render={(props) => <Login {...props} update={this.update} />}>
                            </Route>

                            <Route path='/register' render={(props) => <Register {...props} update={this.update} />}>
                            </Route>

                            <Route path='/home' render={(props) => <Home {...props} update={this.update} />}>
                            </Route>

                            <Route path='/profile/:id' render={(props) => <Profile key={props.match.params.id} {...props} update={this.update} updateRequests={this.updateRequests} />}>
                            </Route>

                            <Route path='/people' render={(props) => <People {...props} update={this.update} updateRequests={this.updateRequests} />}>
                            </Route>

                            <Route path='/notes' render={(props) => <Notes {...props} update={this.update} />}>
                            </Route>
                            
                            <Route path='/note/:id' render={(props) => <Note key={props.match.params.id} {...props} update={this.update} />}>
                            </Route>

                            <Route path='/surveys' render={(props) => <Surveys {...props} update={this.update} />}>
                            </Route>

                            <Route path='/survey/fill/:id' render={(props) => <FillSurvey key={props.match.params.id} {...props} update={this.update} />}></Route>

                            <Route path='/survey/results/:id' render={(props) => <SurveyResults key={props.match.params.id} {...props} update={this.update} />}></Route>

                            <Route path='/survey/answers/:id' render={(props) => <AnsweredSurvey key={props.match.params.id} {...props} update={this.update} />}></Route>

                            <Route path='/quizzes' render={(props) => <Quizzes {...props} update={this.update} />}>
                            </Route>

                            <Route path='/quiz/play/:id' render={(props) => <PlayQuiz key={props.match.params.id} {...props} update={this.update} />}></Route>
                            <Route path='/quiz/scores/:id' render={(props) => <QuizScores key={props.match.params.id} {...props} update={this.update} />}></Route>

                            <Route path='/messages' render={(props) => <Messages {...props} update={this.update} />}>
                            </Route>

                            <Route>
                                <Redirect to='/login' />
                            </Route>
                        </Switch>
                    </Layout>
                </Router>

            </SnackbarProvider>
        )
    }
};