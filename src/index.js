const {app, server} = require('./app')
const logger = require('./utils/logger')

const PORT = process.env.PORT || 3000

server.listen(PORT, ()=>{
    logger.info('app', `Server started successfully`, { port: PORT, environment: process.env.NODE_ENV || 'development' })
})