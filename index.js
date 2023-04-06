import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from "cors"
import * as dotenv from 'dotenv';
import config from 'config';
import fileUpload from 'express-fileupload';

// routes
import routes from './routes/index.js'

// vars
const env = dotenv.config().parsed;
const app = express();
const PORT = env.PORT || 6060;
const db = env.DB_KEY;

// data base
mongoose.set("strictQuery", false);
mongoose.connect(db)
	.then(res => console.log(config.messages.dbConnect))
	.catch(err => console.log(`Error: ${err}`))

// middlewars
app.use(cors());
app.use(fileUpload()); //позволяет получать formData в запросах
app.use(express.json()); // позволяет читать json в запросах
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :res[content-length] :response-time ms')); // выведение в консоль всех запросов
app.use('/', express.static('./static') ); // путь для всех элементов
app.use(routes) // use Routes API



// start server
app.listen(PORT, (err) => {
	if(err) return console.log(err);
	console.log(config.messages.serverStarted)
	console.log(`link: http://localhost:${PORT}`)
})