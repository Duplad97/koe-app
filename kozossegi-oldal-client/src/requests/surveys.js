import axios from 'axios';
import { BASE_URI, DELETE_SURVEY, GET_ALL_SURVEYS, GET_OWN_SURVEYS, GET_SURVEY, GET_SURVEY_ANSWERS, SAVE_NEW_SURVEY, SET_SURVEY_PRIVATE, SET_SURVEY_PUBLIC, SUBMIT_ANSWER, UPDATE_SURVEY } from '../config/api.config';

/**
 * 
 * Az összes, felhasználó által látható kérdőív kérése.
 */
export const getAllSurveys = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_ALL_SURVEYS
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Felhasználó saját kérdőíveinek kérése.
 */
export const getOwnSurveys = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_OWN_SURVEYS
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Új kérdőív létrehozása.
 */
export const saveNewSurvey = async (token, data) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + SAVE_NEW_SURVEY,
        data: data
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kérdőív láthatóságának publikusra állítása.
 */
export const setSurveyPublic = async (token, id) => {
    const config = {
        method: 'patch',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + SET_SURVEY_PUBLIC + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kérdőív láthatóságának privátra állítása.
 */
export const setSurveyPrivate = async (token, id) => {
    const config = {
        method: 'patch',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + SET_SURVEY_PRIVATE + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kérdőív adatainak kérése, azonosító alapján.
 */
export const getSurveyById = async (token, id) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_SURVEY + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Felhasználó válaszainak hozzárendelése egy kérdőívhez.
 */
export const submitAnswers = async (token, data) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        data: data,
        url: BASE_URI + SUBMIT_ANSWER
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kérdőív törlése azonosító alapján.
 */
export const deleteSurvey = async (token, id) => {
    const config = {
        method: 'delete',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + DELETE_SURVEY + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Kérdőív adatinak módosítása, azonosító alapján.
 */
export const updateSurvey = async (token, id, data) => {
    const config = {
        method: 'patch',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + UPDATE_SURVEY + id,
        data: data
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * A felhasználó egy kérdőívhez tartozó saját válaszainak kérése. 
 */
export const getSubmittedAnswers = async (token, id) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_SURVEY_ANSWERS + id
    }
    const response = await axios(config);
    return response;
}