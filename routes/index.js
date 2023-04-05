import express from 'express';
const app = express();

// routes
import routesApp from './RouteApp.js'
import routesUser from './RouteUser.js';


// use routes
app.use(routesApp) // app Routes
app.use(routesUser) // user Routes


export default app;