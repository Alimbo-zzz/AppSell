import * as globalVars from '../utils/globalVars.js';

export default (model) =>{


	return {
		id: model?.id,
		username: model?.username,
		email: model?.email,
		avatarUrl: model?.avatarUrl,
		created: new Date(model?.createdAt).getTime()
	}

};
