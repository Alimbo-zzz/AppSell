import nodemailer from "nodemailer";
import setMailHTML from './setMailHTML.js';
import config from 'config';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const env = dotenv.config().parsed;


// ______mailer
const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	service: 'gmail',
	secure: false,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS
	}
})


const sendActivationLink = async function(to, link){
	const mail_options = {
		from: env.SMTP_USER,
		to,    // кому отправить
		subject: `AppSell активация аккаунта на ${env.BASE_URL}`,
		html: `
			<div>
				<h1>Для активации перейдите по ссылке</h1>
				<a href="${link}" target="_blank">${link}</a>
			</div>
		`
	}

	transporter.sendMail(mail_options, err=>{
		if(err) {
			// res.status(200).json({"status": "error"});
			console.log('EMAIL sent error');
			console.log(err);
		}
		else {
			// res.status(200).json({"status": "success"});
			console.log('EMAIL sent success');
		}
	})

}




export {
	sendActivationLink
}
