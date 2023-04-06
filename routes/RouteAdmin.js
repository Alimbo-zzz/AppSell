import express from 'express';
import checkAuthAdmin from '../utils/checkAuthAdmin.js';
import * as AdminController from '../controllers/ControllerAdmin.js'
import * as AdminVal from '../validations/ValidationAdmin.js'
const router = express.Router();
import * as dotenv from 'dotenv';



router.post('/v1/admin/register', AdminVal.register, AdminController.register )
router.get('/v1/admin/activate/:id', AdminController.activate )
router.get('/v1/admin/login', AdminVal.login, AdminController.login )
router.get('/v1/admin/auth', checkAuthAdmin, AdminController.auth )
router.post('/v1/admin/edit', checkAuthAdmin,  AdminVal.edit, AdminController.edit )
router.delete('/v1/admin/delete/avatar', checkAuthAdmin, AdminController.deleteAvatar )
router.delete('/v1/admin/delete/account', checkAuthAdmin, AdminController.deleteAccount )
// product
router.post('/v1/admin/product/upload', checkAuthAdmin, AdminVal.productUpload, AdminController.productUpload )
router.post('/v1/admin/product/edit', checkAuthAdmin, AdminVal.productEdit, AdminController.productEdit )
router.delete('/v1/admin/product/delete/:productId', checkAuthAdmin, AdminController.productDelete )
router.get('/v1/admin/product/list', checkAuthAdmin, AdminVal.productList, AdminController.productList )

export default router;