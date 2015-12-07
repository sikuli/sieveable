'use strict';
const express = require('express'),
    router = express.Router();

module.exports = () => {
    router.get('/', (req, res) => {
        res.render('browser');
    });
    return router;
};
