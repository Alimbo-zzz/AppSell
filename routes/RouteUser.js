import express from 'express';
import checkAuthUser from '../utils/checkAuthUser.js';
import * as UserController from '../controllers/ControllerUser.js'
import * as UserVal from '../validations/ValidationUser.js'
const router = express.Router();
import * as dotenv from 'dotenv';



router.post('/v1/user/register', UserVal.register, UserController.register )
router.get('/v1/user/activate/:id', UserController.activate )
router.get('/v1/user/login', UserVal.login, UserController.login )
router.get('/v1/user/auth', checkAuthUser, UserController.auth )
router.post('/v1/user/edit', checkAuthUser,  UserVal.edit, UserController.edit )
router.delete('/v1/user/delete/avatar', checkAuthUser, UserController.deleteAvatar )
router.delete('/v1/user/delete/account', checkAuthUser, UserController.deleteAccount )
// image
router.post('/v1/user/image/upload', checkAuthUser, UserVal.uploadImage, UserController.uploadImage )
router.post('/v1/user/image/edit', checkAuthUser, UserVal.editImage, UserController.editImage )
router.delete('/v1/user/image/delete/:imageId', checkAuthUser, UserController.deleteImage )
router.get('/v1/user/image/list', checkAuthUser, UserVal.imageList, UserController.imageList )

export default router;