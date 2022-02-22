import axios from "axios";
import { BASE_URI, GET_ALL_MESSAGES, GET_UNREAD_MESSAGES } from "../config/api.config";

/**
 * 
 * Összes csevegés kérése.
 */
export const getAllMessages = async(token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_ALL_MESSAGES
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Olvasatlan csevegések kérése.
 */
export const getUnreadMessages = async(token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_UNREAD_MESSAGES
    }
    const response = await axios(config);
    return response;
}