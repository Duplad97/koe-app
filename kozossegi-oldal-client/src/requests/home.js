import axios from "axios";
import { BASE_URI, GET_HOME_DATA } from "../config/api.config";

/**
 * 
 * Kezdőképernyőn megjelenő "posztok" kérése.
 */
export const getHomeData = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_HOME_DATA
    }
    const response = await axios(config);
    return response;
}