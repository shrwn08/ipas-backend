import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT) || 587,
secure: Number(process.env.SMTP_PORT) === 465,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});

export const sendEmail = ({ to, subject, text, html }) =>
transporter.sendMail({
from: process.env.MAIL_FROM || process.env.SMTP_USER,
to,
subject,
text,
html,
});