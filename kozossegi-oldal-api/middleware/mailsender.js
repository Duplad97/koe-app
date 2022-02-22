const nodemailer = require('nodemailer');
const config = require('../config/mail.config');

exports.sendRegistrationMail = (to, firstName, lastName, id, code) => {
    const transporter = nodemailer.createTransport(config);

    const mailOptions = {
        from: config.auth.user,
        to: to,
        subject: 'KoE - Aktiválás',
        html: `<h3>Kedves ${lastName} ${firstName}!</h3>
        <p>Az alábbi linkre kattintva erősítsd meg az email címed!<br>
        <a href="http://localhost:3000/confirm/${code}/${id}" target="blank">Link</a>
        </p>
        <p>Üdv,<br>
        KoE - Közösségi oldal Egyetemistáknak</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}