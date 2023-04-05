import config from 'config';
import {validationResult} from 'express-validator';
import moment from 'moment/moment.js';
import {unlinkSync, unlink} from 'fs';
import dotenv from 'dotenv';
import { v4 as setId } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const env = dotenv.config().parsed;

import { sendActivationLink } from '../utils/sendMail.js';
import UserModel from '../models/User.js';
import ItemModel from '../models/Item.js';

import UserDTO from '../dtos/UserDTO.js'
import ItemDTO from '../dtos/ItemDTO.js'



export const register = async function(req, res){
	try{
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		const {email} = req.body;
		const userExist = await UserModel.findOne({email});
		const userObj = await setUserObj(req);
		const activationLink = `${env.BASE_URL}/v1/user/activate/${setId()}`;
		
		if(!userExist){
			const doc = new UserModel({...userObj, activationLink});
			await doc.save();
		}
		if(userExist && userExist.isActivated) return res.status(400).json({success: false, message: `Пользователь с почтой ${email} уже существует`});
		if(userExist){
			await userExist.update({...userObj, activationLink})
			if(userObj?.avatarUrl){
				let oldFileName = userExist.avatarUrl.split('/').pop();			
				unlinkSync(`./static/avatars/${oldFileName}`)
			}
		}

		await sendActivationLink(email, activationLink);		
		res.status(200).json({success: true, message: `На почту ${email} отправлен код подтверждения`})


		// funcs

		async function setUserObj(req){
			const {email, username, password} = req.body;
			const id = `user-${setId()}`;
			const salt = await bcrypt.genSalt(10)
			const passwordHash = await bcrypt.hash(password, salt);
			const avatar = req?.files?.avatar;
			const result = {email, username, passwordHash, id} 

			if(avatar) {
				if(avatar.mimetype.split('/')[0] !== 'image') return res.status(400).json({success: false, message: config.messages.noImageFile});
				if(avatar.size > config.image.size) return res.status(400).json({success: false, message: config.messages.imageSize});

				let date = moment().format('DDMMYYYY-HHmmss__SSS');
				let avatarName = `avatar-${date}-${avatar.name}`;
				let avatarLink = `${env.BASE_URL}/avatars/${avatarName}`;

				avatar.mv('./static/avatars/' + avatarName)
				result.avatarUrl = avatarLink;
			}

			return result;
		}
	}
	catch(error){
		console.log(`/v1/user/register -- ${error}`);
		res.status(500).json({success: false, error, message: config.messages.noRegister})
	}
}

export const activate = async function(req, res){
	try{
		const activationLink = `${env.BASE_URL}/v1/user/activate/${req.params.id}`;
		const user = await UserModel.findOne({activationLink});
		if(!user) return res.status(400).send('<h1>Ссылка неактивна</h1>');

		await user.update({isActivated: true});

		res.status(200).send('<h1>Аккаунт активирован</h1>')
	}
	catch(error){
		console.log(`/v1/user/activate -- ${error}`);
		res.status(500).json({success: false, error, message: 'Непредвиденная ошибка'})
	}
}

export const login = async function(req, res){
	try{
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		const {email, password} = req.query;
		const user = await UserModel.findOne({email});
		if(!user) return res.status(400).json({success: false, message: config.messages.invalidLoginPass}) // не указываем что не найдена именно почта для безопасности
		const isValidPass = await bcrypt.compare(password, user.passwordHash)
		if(!isValidPass) return res.status(400).json({success: false, message: config.messages.invalidLoginPass})  // не указываем что не найден именно пароль для безопасности

		const token = jwt.sign({ id: user.id }, config.token.key, {expiresIn: config.token.age})

		res.status(200).json({success: true, token})

	}
	catch(error){
		console.log(`/v1/user/login -- ${error}`);
		res.status(500).json({success: false, error, message: 'Непредвиденная ошибка'})
	}
}

export const auth = async function(req, res){
  // await fetch(`${env.BASE_URL}/${env.API_VERSION}/user/update`, {headers:{authorization: req?.headers?.authorization}})
	try{
		const {userId} = req;
		const user = await UserModel.findOne({id: userId});
		if(!user) return res.status(400).json({success: false, message: 'User не найден'});

		const data = UserDTO(user);

		res.status(200).json({success: true, data})
	}
	catch(error){
		console.log(`/api/user/auth -- ${error}`);
		res.status(500).json({success: false, error, message: 'Непредвиденная ошибка'})
	}
}

export const edit = async function(req, res) {
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		if(!Object.keys(req.body).length && !req?.files) return res.status(400).json({success: false, massage: config.messages.keysEmpty});;
		const {userId} = req;
		const user = await UserModel.findOne({id: userId});
		if(!user) return res.status(400).json({success: false, error, message: 'User не найден'});
		const dataKeys = ['username'];
		const avatar = req?.files?.avatar;

		const editData = {};

		for(let key in req.body) { dataKeys.forEach(el => key === el ? editData[key] = req.body[key] : '') } //добавляем все ключи в editData
		if(avatar) {
			if(avatar.mimetype.split('/')[0] !== 'image') return res.status(400).json({success: false, message: config.messages.noImageFile});
			if(avatar.size > config.image.size) return res.status(400).json({success: false, message: config.messages.imageSize});
			
			let oldFileName = user.avatarUrl.split('/').pop();
			let date = moment().format('DDMMYYYY-HHmmss__SSS');
			let avatarName = `avatar-${date}-${avatar.name}`;
			let avatarLink = `${env.BASE_URL}/avatars/${avatarName}`;

			avatar.mv('./static/avatars/' + avatarName)
			editData.avatarUrl = avatarLink;
			unlink(`./static/avatars/${oldFileName}`, (err) => console.log(err) );
		}

		await user.updateOne(editData);
		const updatedUser = await UserModel.findOne({id: userId});

		const data = UserDTO(updatedUser);

		res.json({success: true, data})
		// fetch(`${env.BASE_URL}/${env.API_VERSION}/user/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/user/edit -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const deleteAvatar = async function(req, res){
	try {
		const {userId} = req;
		const user = await UserModel.findOne({id: userId});
		if(!user) return res.status(400).json({success: false,  message: 'user не найден'});
		

		let oldFileName = user.avatarUrl.split('/').pop();
		unlink(`./static/avatars/${oldFileName}`, (err) => console.log(err) )

		let defaultAvatarLink = `${env.BASE_URL}/resources/user-logo.png`;
		await user.update({avatarUrl: defaultAvatarLink})

		const data = {defaultAvatarLink}

		res.status(200).json({success: true, data})
		// fetch(`${env.BASE_URL}/${env.API_VERSION}/user/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/user/delete/avatar -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const deleteAccount = async function(req, res){
	try {
		const {userId} = req;
		await UserModel.deleteOne({id: userId});
		res.status(200).json({success: true, message: 'Аккаунт удален'})
	} catch (error) {
		console.log(`/api/user/update -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const uploadImage = async function(req, res){
	try{
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		const {userId} = req;
		const user = await UserModel.findOne({id: userId});
		if(!user) return res.status(400).json({success: false, message: 'User не найден'});
		const {article, title, description, category, platform, price, templateType} = req.body;
		const image = req?.files?.image;

		if(image?.mimetype?.split('/')[0] !== 'image') return res.status(400).json({success: false, message: config.messages.noImageFile});
		if(image.size > config.image.size) return res.status(400).json({success: false, message: config.messages.imageSize});

		let date = moment().format('DDMMYYYY-HHmmss__SSS');
		let imageName = `image-${date}-${image.name}`;
		let imageURL = `${env.BASE_URL}/images/${imageName}`;
		await image.mv('./static/images/' + imageName)
		const imageId = `image-${setId()}`;
		
		
		const doc = new ItemModel({id: imageId, refId: userId, imageURL, article, title, description, category, platform, price, templateType});
		await doc.save();
		const data = ItemDTO(doc);

		res.status(200).json({success: true, data})

	}
	catch(error){
		console.log(`/v1/user/upload/image -- ${error}`);
		res.status(500).json({success: false, error, message: config.messages.noAccess})
	}
}

export const editImage = async function(req, res){
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		if(!Object.keys(req.body).length && !req?.files) return res.status(400).json({success: false, massage: config.messages.keysEmpty});;
		const {userId} = req;
		const user = await UserModel.findOne({id: userId});
		if(!user) return res.status(400).json({success: false, message: 'user не найден'});
		const {imageId} = req.body;
		const db_item = await ItemModel.findOne({id: imageId});
		if(!db_item) return res.status(400).json({success: false, message: 'изображение не найден'});

		const dataKeys = ['article', 'title', 'description', 'category', 'platform', 'price', 'templateType'];
		const image = req?.files?.image;
		const editData = {};
		for(let key in req.body) { dataKeys.forEach(el => key === el ? editData[key] = req.body[key] : '') } //добавляем все ключи в editData
		if(image) {
			if(image?.mimetype?.split('/')[0] !== 'image') return res.status(400).json({success: false, message: config.messages.noImageFile});
			if(image.size > config.image.size) return res.status(400).json({success: false, message: config.messages.imageSize});
			
			let oldFileName = db_item.imageURL.split('/').pop();
			let date = moment().format('DDMMYYYY-HHmmss__SSS');
			let imageName = `image-${date}-${image.name}`;
			let imageLink = `${env.BASE_URL}/images/${imageName}`;

			image.mv('./static/images/' + imageName)
			editData.imageURL = imageLink;
			unlink(`./static/images/${oldFileName}`, (err) => console.log(err) );
		}

		await db_item.updateOne(editData);
		const updatedItem = await ItemModel.findOne({id: imageId});

		const data = ItemDTO(updatedItem);

		res.status(200).json({success: true, data})
		// fetch(`${env.BASE_URL}/${env.API_VERSION}/user/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/user/image/edit -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const deleteImage = async function(req, res){
	try {
		const {userId} = req;
		const user = await UserModel.findOne({id: userId});
		if(!user) return res.status(400).json({success: false, message: 'user не найден'});
		const {imageId} = req.params;
		const db_item = await ItemModel.findOne({id: imageId});
		if(!db_item) return res.status(400).json({success: false, message: 'изображение не найден'});

		let oldFileName = db_item.imageURL.split('/').pop();
		unlink(`./static/images/${oldFileName}`, (err) => console.log(err) )
		await ItemModel.deleteOne({id: imageId});

		res.status(200).json({success: true, message: 'изображение удалено'})
		// fetch(`${env.BASE_URL}/${env.API_VERSION}/user/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/user/delete/avatar -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const imageList = async function(req, res){	
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		const {userId} = req;
		const user = await UserModel.findOne({id: userId});
		if(!user) return res.status(400).json({success: false, message: 'user не найден'}); 
		const {limit=30, page=1} = req?.query;
		const db_list = await ItemModel.find();
		const pageCount = Math.ceil(db_list.length / limit);
		

		const list = db_list.map(el => ({ ...ItemDTO(el) }))
		const resultArr = [];
		while(list.length) resultArr.push(list.splice(0,limit)); // Разбираем массив

		const data = {
			images: resultArr[page-1] || [],
			page,
			pageCount,
			totalCount: db_list.length
		};

		res.status(200).json({success: true, data})
		// fetch(`${env.BASE_URL}/admin/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/user/image/list -- ${error}`);
		res.status(500).json({success: false, error, message: config.messages.noAccess})
	}
}
