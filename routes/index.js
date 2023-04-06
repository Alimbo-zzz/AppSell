import express from 'express';
const app = express();

// routes
import routesApp from './RouteApp.js'
import routesAdmin from './RouteAdmin.js';


// use routes
app.use(routesApp) // app Routes
app.use(routesAdmin) // user Routes


export default app;