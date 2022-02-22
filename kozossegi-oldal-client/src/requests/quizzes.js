import axios from "axios";
import { BASE_URI, DELETE_QUIZ, GET_ALL_QUIZZES, GET_OWN_QUIZZES, GET_OWN_SCORES, GET_QUIZ, GET_SCORES, SAVE_NEW_QUIZ, SET_QUIZ_PRIVATE, SET_QUIZ_PUBLIC, SUBMIT_SCORE, UPDATE_QUIZ } from "../config/api.config";

/**
 * 
 * Összes, felhasználó által látható kvíz kérése.
 */
export const getAllQuizzes = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_ALL_QUIZZES
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Felhasználó saját kvízeinek kérése.
 */
export const getOwnQuizzes = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_OWN_QUIZZES
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kvíz adatainak kérése azonosító alapján.
 */
export const getQuizById = async (token, id) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_QUIZ + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Új kvíz mentése.
 */
export const saveNewQuiz = async (token, data) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + SAVE_NEW_QUIZ,
        data: data
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kvíz láthatóságának publikusra állítása.
 */
export const setQuizPublic = async (token, id) => {
    const config = {
        method: 'patch',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + SET_QUIZ_PUBLIC + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kvíz láthatóságának privátra állítása.
 */
export const setQuizPrivate = async (token, id) => {
    const config = {
        method: 'patch',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + SET_QUIZ_PRIVATE + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kvíz törlése azonosító alapján.
 */
export const deleteQuiz = async (token, id) => {
    const config = {
        method: 'delete',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + DELETE_QUIZ + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Az összes kvízhez tartozó saját eredményünk kérése.
 */
export const getOwnScores = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_OWN_SCORES
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Egy adott kvízhez tartozó összes felhasználó eredményének kérése.
 */
export const getScores = async (token, id) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_SCORES + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Új eredmény hozzáadása egy kvízhez.
 */
export const submitScore = async (token, id, data) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + SUBMIT_SCORE + id,
        data: data
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kvíz adatainak módosítása.
 */
export const updateQuiz = async (token, id, data) => {
    const config = {
        method: 'patch',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + UPDATE_QUIZ + id,
        data: data
    }
    const response = await axios(config);
    return response;
}