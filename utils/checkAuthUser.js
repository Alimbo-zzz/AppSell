import jwt from 'jsonwebtoken';
import config from 'config';

export default (req, res, next) => {
	try {
		const token = req.headers?.authorization;
		if(!token) return res.status(403).json({success: false, message: config.messages.noToken});

		const decoded = jwt.verify(token, config.token.key)
		const {id, iat, exp} = decoded;
		// iat - (issued at) время создания токена
		// exp - (expire time) срок действия токена
		const nowDate = new Date().getTime();
		const expire =  exp * 1000;
		if(nowDate >= expire) return res.status(403).json({success: false, message: config.messages.deadToken});

		req.userId = id;
		next();
	} catch (error) {
		console.log(`checkAuth Token Error -- ${error}`);
		return res.status(500).json({success: false, message: config.messages.noAccess});
	}


};