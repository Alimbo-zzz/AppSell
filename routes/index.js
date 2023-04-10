import express from 'express';
const app = express();

import routesApp from './RouteApp.js'
import routesAdmin from './RouteAdmin.js';
import routesBot from './RouteBot.js';


app.use(routesApp)
app.use(routesAdmin) 
app.use(routesBot)


export default app;