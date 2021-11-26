const nodeMailer = require("nodemailer");

const defaultEmailData = { from: "noreply@socnet-app.com" };

exports.sendEmail = (emailData) => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "vodro.dev@gmail.com",
            pass: "yxwzmhrnvrmnxoyy",
        },
    });

    return transporter
        .sendMail(emailData)
        .then((info) => {
            console.log(`Message sent: ${info.response}`);
        })
        .catch((err) => {
            console.log(`Problem occured while sending email: ${err}`);
        });
};
