const view = require('./view.js');

module.exports = (app) => {
    app.use('/api', view)
}