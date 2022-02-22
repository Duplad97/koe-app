const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.User;
const BlackList = db.BlackList;

/**
 * Token érvényességének ellenőrzése.
 */
verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    BlackList.findOne({
        where: {
            token: token
        }
    }).then(invalidToken => {
        if (invalidToken) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        } else {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    return res.status(401).send({
                        message: "Unauthorized!"
                    });
                }
                req.userId = decoded.id;
                next();
            });
        }
    }).catch(err => {
        res.status(500).send({ message: err.message });
    })
};

/*
isAdmin = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        if (user.role === "admin") {
            next();
            return;
        } else {
            res.status(403).send({
                message: "Require Admin Role!"
            });
        }
    });
};
*/

/**
 * A felhasználói fiók aktív állapotának ellenőrzése.
 */
isActive = async (req, res, next) => {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (user.status === "active") {
        next();
        return;
    } else {
        res.status(403).send({ message: "Email not verified yet!" });
    }
}

/*isModerator = (req, res, next) => {
};
*/

const authJwt = {
    verifyToken: verifyToken,
    /*isAdmin: isAdmin,
    isModerator: isModerator,*/
    isActive: isActive
};
module.exports = authJwt;
