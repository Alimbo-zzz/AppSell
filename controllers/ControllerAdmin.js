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
import AdminModel from '../models/Admin.js';
import ProductModel from '../models/Product.js';

import AdminDTO from '../dtos/AdminDTO.js'
import ProductDTO from '../dtos/ProductDTO.js'



export const register = async function(req, res){
	try{
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		const {email} = req.body;
		const adminExist = await AdminModel.findOne({email});
		const adminObj = await setAdminObj(req);
		const activationLink = `${env.BASE_URL}/v1/admin/activate/${setId()}`;
		
		if(!adminExist){
			const doc = new AdminModel({...adminObj, activationLink});
			await doc.save();
		}
		if(adminExist && adminExist.isActivated) return res.status(400).json({success: false, message: `Пользователь с почтой ${email} уже существует`});
		if(adminExist){
			await adminExist.update({...adminObj, activationLink})
			if(adminObj?.avatarUrl){
				let oldFileName = adminExist.avatarUrl.split('/').pop();			
				unlinkSync(`./static/avatars/${oldFileName}`)
			}
		}

		await sendActivationLink(email, activationLink);		
		res.status(200).json({success: true, message: `На почту ${email} отправлен код подтверждения`})


		// funcs

		async function setAdminObj(req){
			const {email, name, password} = req.body;
			const id = `admin-${setId()}`;
			const salt = await bcrypt.genSalt(10)
			const passwordHash = await bcrypt.hash(password, salt);
			const avatar = req?.files?.avatar;
			const result = {email, name, passwordHash, id} 

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
		console.log(`/v1/admin/register -- ${error}`);
		res.status(500).json({success: false, error, message: config.messages.noRegister})
	}
}

export const activate = async function(req, res){
	try{
		const activationLink = `${env.BASE_URL}/v1/admin/activate/${req.params.id}`;
		const admin = await AdminModel.findOne({activationLink});
		if(!admin) return res.status(400).send('<h1>Ссылка неактивна</h1>');

		await admin.update({isActivated: true});

		res.status(200).send('<h1>Аккаунт активирован</h1>')
	}
	catch(error){
		console.log(`/v1/admin/activate -- ${error}`);
		res.status(500).json({success: false, error, message: 'Непредвиденная ошибка'})
	}
}

export const login = async function(req, res){
	try{
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		const {email, password} = req.query;
		const admin = await AdminModel.findOne({email});
		if(!admin) return res.status(400).json({success: false, message: config.messages.invalidLoginPass}) // не указываем что не найдена именно почта для безопасности
		const isValidPass = await bcrypt.compare(password, admin.passwordHash)
		if(!isValidPass) return res.status(400).json({success: false, message: config.messages.invalidLoginPass})  // не указываем что не найден именно пароль для безопасности

		const token = jwt.sign({ id: admin.id }, config.token.key, {expiresIn: config.token.age})

		res.status(200).json({success: true, token})

	}
	catch(error){
		console.log(`/v1/admin/login -- ${error}`);
		res.status(500).json({success: false, error, message: 'Непредвиденная ошибка'})
	}
}

export const auth = async function(req, res){
  // await fetch(`${env.BASE_URL}/${env.API_VERSION}/admin/update`, {headers:{authorization: req?.headers?.authorization}})
	try{
		const {adminId} = req;
		const admin = await AdminModel.findOne({id: adminId});
		if(!admin) return res.status(400).json({success: false, message: 'Admin не найден'});

		const data = AdminDTO(admin);

		res.status(200).json({success: true, data})
	}
	catch(error){
		console.log(`/api/admin/auth -- ${error}`);
		res.status(500).json({success: false, error, message: 'Непредвиденная ошибка'})
	}
}

export const edit = async function(req, res) {
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		if(!Object.keys(req.body).length && !req?.files) return res.status(400).json({success: false, massage: config.messages.keysEmpty});;
		const {adminId} = req;
		const admin = await AdminModel.findOne({id: adminId});
		if(!admin) return res.status(400).json({success: false, error, message: 'Admin не найден'});
		const dataKeys = ['name'];
		const avatar = req?.files?.avatar;

		const editData = {};

		for(let key in req.body) { dataKeys.forEach(el => key === el ? editData[key] = req.body[key] : '') } //добавляем все ключи в editData
		if(avatar) {
			if(avatar.mimetype.split('/')[0] !== 'image') return res.status(400).json({success: false, message: config.messages.noImageFile});
			if(avatar.size > config.image.size) return res.status(400).json({success: false, message: config.messages.imageSize});
			
			let oldFileName = admin.avatarUrl.split('/').pop();
			let date = moment().format('DDMMYYYY-HHmmss__SSS');
			let avatarName = `avatar-${date}-${avatar.name}`;
			let avatarLink = `${env.BASE_URL}/avatars/${avatarName}`;

			avatar.mv('./static/avatars/' + avatarName)
			editData.avatarUrl = avatarLink;
			unlink(`./static/avatars/${oldFileName}`, (err) => console.log(err) );
		}

		await admin.updateOne(editData);
		const updatedAdmin = await AdminModel.findOne({id: adminId});

		const data = AdminDTO(updatedAdmin);

		res.json({success: true, data})
		// fetch(`${env.BASE_URL}/${env.API_VERSION}/admin/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/admin/edit -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const deleteAvatar = async function(req, res){
	try {
		const {adminId} = req;
		const admin = await AdminModel.findOne({id: adminId});
		if(!admin) return res.status(400).json({success: false,  message: 'admin не найден'});
		

		let oldFileName = admin.avatarUrl.split('/').pop();
		unlink(`./static/avatars/${oldFileName}`, (err) => console.log(err) )

		let defaultAvatarLink = `${env.BASE_URL}/resources/user-logo.png`;
		await admin.update({avatarUrl: defaultAvatarLink})

		const data = {defaultAvatarLink}

		res.status(200).json({success: true, data})
		// fetch(`${env.BASE_URL}/${env.API_VERSION}/admin/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/admin/delete/avatar -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const deleteAccount = async function(req, res){
	try {
		const {adminId} = req;
		await AdminModel.deleteOne({id: adminId});
		res.status(200).json({success: true, message: 'Аккаунт удален'})
	} catch (error) {
		console.log(`/api/admin/update -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}


// product

export const productUpload = async function(req, res){
	try{
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		const {adminId} = req;
		const admin = await AdminModel.findOne({id: adminId});
		if(!admin) return res.status(400).json({success: false, message: 'Admin не найден'});
		const {article, title, description, category, platform, price, templateType} = req.body;
		const image = req?.files?.image;

		if(image?.mimetype?.split('/')[0] !== 'image') return res.status(400).json({success: false, message: config.messages.noImageFile});
		if(image.size > config.image.size) return res.status(400).json({success: false, message: config.messages.imageSize});

		let date = moment().format('DDMMYYYY-HHmmss__SSS');
		let imageName = `image-${date}-${image.name}`;
		let imageURL = `${env.BASE_URL}/products/${imageName}`;
		await image.mv('./static/products/' + imageName)
		const productId = `product-${setId()}`;
		
		
		const doc = new ProductModel({id: productId, refId: adminId, imageURL, article, title, description, category, platform, price, templateType});
		await doc.save();
		const data = ProductDTO(doc);

		res.status(200).json({success: true, data})

	}
	catch(error){
		console.log(`/v1/admin/product/upload -- ${error}`);
		res.status(500).json({success: false, error, message: config.messages.noAccess})
	}
}

export const productEdit = async function(req, res){
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		if(!Object.keys(req.body).length && !req?.files) return res.status(400).json({success: false, massage: config.messages.keysEmpty});;
		const {adminId} = req;
		const admin = await AdminModel.findOne({id: adminId});
		if(!admin) return res.status(400).json({success: false, message: 'admin не найден'});
		const {productId} = req.body;
		const db_product = await ProductModel.findOne({id: productId});
		if(!db_product) return res.status(400).json({success: false, message: 'изображение не найден'});

		const dataKeys = ['article', 'title', 'description', 'category', 'platform', 'price', 'templateType'];
		const image = req?.files?.image;
		const editData = {};
		for(let key in req.body) { dataKeys.forEach(el => key === el ? editData[key] = req.body[key] : '') } //добавляем все ключи в editData
		if(image) {
			if(image?.mimetype?.split('/')[0] !== 'image') return res.status(400).json({success: false, message: config.messages.noImageFile});
			if(image.size > config.image.size) return res.status(400).json({success: false, message: config.messages.imageSize});
			
			let oldFileName = db_product.imageURL.split('/').pop();
			let date = moment().format('DDMMYYYY-HHmmss__SSS');
			let imageName = `image-${date}-${image.name}`;
			let imageLink = `${env.BASE_URL}/products/${imageName}`;

			image.mv('./static/products/' + imageName)
			editData.imageURL = imageLink;
			unlink(`./static/products/${oldFileName}`, (err) => console.log(err) );
		}

		await db_product.updateOne(editData);
		const updatedProduct = await ProductModel.findOne({id: productId});

		const data = ProductDTO(updatedProduct);

		res.status(200).json({success: true, data})
		// fetch(`${env.BASE_URL}/${env.API_VERSION}/admin/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/admin/product/edit -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const productDelete = async function(req, res){
	try {
		const {adminId} = req;
		const admin = await AdminModel.findOne({id: adminId});
		if(!admin) return res.status(400).json({success: false, message: 'admin не найден'});
		const {productId} = req.params;
		const db_product = await ProductModel.findOne({id: productId});
		if(!db_product) return res.status(400).json({success: false, message: 'изображение не найден'});

		let oldFileName = db_product.imageURL.split('/').pop();
		unlink(`./static/products/${oldFileName}`, (err) => console.log(err) )
		await ProductModel.deleteOne({id: productId});

		res.status(200).json({success: true, message: 'изображение удалено'})
		// fetch(`${env.BASE_URL}/${env.API_VERSION}/admin/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/admin/product/delete -- ${error}`);
		res.status(400).json({success: false, error, message: config.messages.noAccess});
	}
}

export const productList = async function(req, res){	
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
		const {adminId} = req;
		const admin = await AdminModel.findOne({id: adminId});
		if(!admin) return res.status(400).json({success: false, message: 'admin не найден'}); 
		const {limit=30, page=1} = req?.query;
		const db_list = await ProductModel.find();
		const pageCount = Math.ceil(db_list.length / limit);
		

		const list = db_list.map(el => ({ ...ProductDTO(el) }))
		const resultArr = [];
		while(list.length) resultArr.push(list.splice(0,limit)); // Разбираем массив

		const data = {
			products: resultArr[page-1] || [],
			page,
			pageCount,
			totalCount: db_list.length
		};

		res.status(200).json({success: true, data})
		// fetch(`${env.BASE_URL}/admin/update`, {headers:{authorization: req?.headers?.authorization}})
	} catch (error) {
		console.log(`/v1/admin/product/list -- ${error}`);
		res.status(500).json({success: false, error, message: config.messages.noAccess})
	}
}
