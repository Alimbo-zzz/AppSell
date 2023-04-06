import mongoose from "mongoose";
import dotenv from 'dotenv';
const env = dotenv.config().parsed;

const ops = {
	timestamps: true
}

const schema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	isActivated: {
		type: Boolean,
		required: false,
		default: false
	},
	name: {
		type: String,
		required: true
	},
	activationLink: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	passwordHash: {
		type: String,
		required: true
	},
	avatarUrl: {
		type: String,
		required: false,
		default: `${env.BASE_URL}/resources/user-logo.png`
	}
}, ops)



export default mongoose.model('Admin', schema);