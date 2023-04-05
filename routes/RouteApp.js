import express from 'express';
import fs from 'fs';

const router = express.Router();


router.get('/', (req, res) => {
	res.send('hello world');	
})

router.get('/activated', (req, res) => {
	res.send('Аккаунт активирован');	
})


export default router;