const express = require('express');
const homeController =  require( "../controllers/homeController");

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage);

    return app.use("/", router);
}

module.exports = initWebRoutes;