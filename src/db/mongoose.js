const mongoose = require('mongoose')
const logger = require('../utils/logger')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

mongoose.connection.on('connected', () => {
    logger.info('mongodb', 'Successfully connected to MongoDB', { url: process.env.MONGODB_URL })
})

mongoose.connection.on('error', (err) => {
    logger.error('mongodb', 'MongoDB connection error', { error: err.message })
})

mongoose.connection.on('disconnected', () => {
    logger.warn('mongodb', 'Disconnected from MongoDB')
})