import * as globalVars from '../utils/globalVars.js';

export default (model) =>{


	return {
		id: model?.id,
		refId: model?.refId,
		imageURL: model?.imageURL,
		article: model?.article,
		title: model?.title,
		description: model?.description,
		category: model?.category,
		platform: model?.platform,
		price: model?.price,
		templateType: model?.templateType,
		created: new Date(model?.createdAt).getTime()
	}

};
