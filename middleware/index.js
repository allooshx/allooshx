const express = require('express');
const insertPosts = require('../controllers/index.js');

module.exports = (app) => {
    app.use(express.json());
    app.use((res, req, next) => {
        insertPosts.insertPosts();
    })
}