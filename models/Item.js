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
	refId: {
		type: String,
		required: true,
	},
	article: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	imageURL: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	platform: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	templateType: {
		type: String,
		required: false,
		default: null,
	}
}, ops)



export default mongoose.model('Item', schema);