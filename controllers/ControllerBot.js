import config from 'config';
import {validationResult} from 'express-validator';
import dotenv from 'dotenv';
const env = dotenv.config().parsed;

import ProductModel from '../models/Product.js';

import ProductDTO from '../dtos/ProductDTO.js'



export const productList = async function(req, res){	
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()) return res.status(400).json({success: false, massage: config.messages.validErr, errors: errors.array()});
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
	} catch (error) {
		console.log(`/v1/bot/product/list -- ${error}`);
		res.status(500).json({success: false, error, message: config.messages.noAccess})
	}
}
