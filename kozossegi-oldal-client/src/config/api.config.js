const host = window.location.hostname;
export const BASE_URI = `http://${host}:8000/api`; // API URL: http / websocket kérésekhez
export const BASE_URL = `http://${host}:8000/`; // Szerver URL: profilképekhez / jegyzet fájlokhoz
//export const BASE_URI = "http://localhost:8000/api";
//export const BASE_URL = "http://localhost:8000/";


/** 
 * API végpontok
*/

//Auth
export const SCHOOLS = "/schools";

export const AUTH = "/auth/";
export const REGISTER = "/auth/register";
export const LOGIN = "/auth/login";
export const LOGOUT = "/auth/logout";
export const CONFIRM_CODE = "/auth/confirm/";
export const RESEND_CODE = "/auth/confirm/resend";


//Users
export const PROFILE = "/users/profile/";
export const GET_FRIENDS = "/users/friends/";
export const GET_SENT_REQUESTS = "/users/request/sent";
export const GET_INC_REQUESTS = "/users/request/incoming";
export const ACCEPT_REQUEST = "/users/request/accept";
export const DECLINE_REQUEST = "/users/request/decline";
export const CANCEL_REQUEST = "/users/request/cancel";
export const SEND_REQUEST = "/users/request/send";
export const DELETE_FRIEND = "/users/friends/delete";
export const UPLOAD_AVATAR = "/users/profile/upload";
export const UPDATE_PROFILE = "/users/profile/update";
export const GET_EXPLORABLE = "/users/explore";


//Notifications
export const GET_UNREAD = "/notifications/unread";
export const GET_ALL = "/notifications/all";
export const READ_NOTIFICATION = "/notifications/read/";
export const DELETE_NOTIFICATION = "/notifications/delete/";

//Notes
export const GET_ALL_NOTES = "/notes/all";
export const GET_OWN_NOTES = "/notes/own";
export const GET_NOTE = "/notes/";
export const UPLOAD_NOTE = "/notes/upload";
export const DELETE_NOTE = "/notes/delete/";
export const UPDATE_NOTE = "/notes/update/";
export const LIKE_NOTE = "/notes/like/";
export const DISLIKE_NOTE = "/notes/like/delete/";
export const COMMENT_NOTE = "/notes/comment/";
export const DELETE_COMMENT = "/notes/comment/delete/";

//Surveys
export const GET_ALL_SURVEYS = "/surveys/all";
export const GET_SURVEY = "/surveys/";
export const GET_OWN_SURVEYS = "/surveys/own";
export const SAVE_NEW_SURVEY = "/surveys/new";
export const UPDATE_SURVEY = "/surveys/update/";
export const DELETE_SURVEY = "/surveys/delete/";
export const SUBMIT_ANSWER = "/surveys/submit";
export const SET_SURVEY_PUBLIC = "/surveys/set/public/";
export const SET_SURVEY_PRIVATE = "/surveys/set/private/";
export const GET_SURVEY_ANSWERS = "/surveys/answers/";

//Quizzes
export const GET_ALL_QUIZZES = "/quizzes/all";
export const GET_OWN_QUIZZES = "/quizzes/own";
export const GET_QUIZ = "/quizzes/";
export const SAVE_NEW_QUIZ = "/quizzes/new";
export const UPDATE_QUIZ = "/quizzes/update/";
export const DELETE_QUIZ = "/quizzes/delete/";
export const SET_QUIZ_PUBLIC = "/quizzes/public/";
export const SET_QUIZ_PRIVATE = "/quizzes/private/";
export const SUBMIT_SCORE = "/quizzes/submit/";
export const GET_OWN_SCORES = "/quizzes/scores/own";
export const GET_SCORES = "/quizzes/scores/";

//Home
export const GET_HOME_DATA = "/home";

//Messages
export const GET_ALL_MESSAGES = "/messages/all";
export const GET_UNREAD_MESSAGES = "/messages/unread";