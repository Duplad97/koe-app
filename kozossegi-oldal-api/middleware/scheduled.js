const moment = require('moment');
const models = require('../models');
const BlackList = models.BlackList;
const SecureCode = models.SecureCode;

/**
 * Az egy napnál régebbi feketelistázott tokenek ürítése.
 */
exports.clearBlackList = async () => {
    const allBlackList = await BlackList.findAll();
    for (let i = 0; i < allBlackList.length; i++) {
        const date = moment(allBlackList[i].createdAt).add(1, 'days').toDate();
        const today = new Date();
        if (date <= today) {
            BlackList.destroy({
                where: {
                    id: allBlackList[i].id
                }
            });
        }
    }
};

/**
 * A 10 percnél régebbi felhasználói fiók aktiválásához
 * szükséges kódok ürítése.
 */
exports.clearSecureCodes = async () => {
    const codes = await SecureCode.findAll();
    for (let i = 0; i < codes.length; i++) {
        const date = moment(codes[i].createdAt).add(10, 'm').toDate();
        const today = new Date();
        console.log('date', date);
        console.log('today', today)
        if (date <= today) {
            SecureCode.destroy({
                where: {
                    id: codes[i].id
                }
            });
        }
    }
};