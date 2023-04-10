import express from 'express';
import * as BotController from '../controllers/ControllerBot.js'
import * as AdminVal from '../validations/ValidationAdmin.js'
const router = express.Router();



router.get('/v1/bot/product/list', AdminVal.productList, BotController.productList )

export default router;