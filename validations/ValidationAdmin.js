import {body, query, header} from 'express-validator';
import config from 'config';




export const register = [
	body('name', 'name должен содержать мин 2 макс 20').isLength({ min: 2, max:20 }),
	body('password', 'name должен содержать мин 6 макс 30').isLength({ min: 6, max:30 }),
	body('email', 'почта не прошла валидацию').isEmail(),
]

export const login = [
	query('password', 'поле не должно быть пустым').notEmpty(),
	query('email', 'почта не прошла валидацию').isEmail(),
]

export const edit = [
	body('name', 'name должен содержать мин 2 макс 20').optional().isLength({ min: 2, max:20 }),
]

export const productUpload = [
	body('article', 'поле не должно быть пустым').notEmpty(),
	body('title', 'поле не должно быть пустым').notEmpty(),
	body('description', 'поле не должно быть пустым').notEmpty(),
	body('category', 'неправильное значение').isIn(["template", "application"]),
	body('platform', 'неправильное значение').isIn(["ios", "android"]), 
	body('price', 'передайте цифру').isNumeric(),
	body('templateType', 'неправильное значение').optional().isIn(["игры","утилиты","остальное"]),
]

export const productEdit = [
	body('productId', 'поле не должно быть пустым').notEmpty(),
	body('article', 'поле не должно быть пустым').optional().notEmpty(),
	body('title', 'поле не должно быть пустым').optional().notEmpty(),
	body('description', 'поле не должно быть пустым').optional().notEmpty(),
	body('category', 'неправильное значение').optional().isIn(["template", "application"]),
	body('platform', 'неправильное значение').optional().isIn(["ios", "android"]), 
	body('price', 'передайте цифру').optional().isNumeric(),
	body('templateType', 'неправильное значение').optional().isIn(["игры","утилиты","остальное"]),
]

export const productList = [
	query('limit', 'передайте цифру').optional().isNumeric(),
	query('page', 'передайте цифру').optional().isNumeric(),
]