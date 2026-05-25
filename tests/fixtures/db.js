const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../../src/models/user')
const Blogs = require('../../src/models/blog')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'User One',
    email: 'userone@example.com',
    password: 'Password123!',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.SECRET_KEY)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'User Two',
    email: 'usertwo@example.com',
    password: 'Password123!',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.SECRET_KEY)
    }]
}

const blogOneId = new mongoose.Types.ObjectId()
const blogOne = {
    _id: blogOneId,
    author: userOneId,
    title: 'First Test Blog',
    content: 'This is the content for the first test blog post.',
    likes: 0
}

const blogTwoId = new mongoose.Types.ObjectId()
const blogTwo = {
    _id: blogTwoId,
    author: userTwoId,
    title: 'Second Test Blog',
    content: 'This is the content for the second test blog post.',
    likes: 5
}

// Function to wipe and seed the database
const setupDatabase = async () => {
    // Clear existing data
    await User.deleteMany()
    await Blogs.deleteMany()

    // Create user 1 with hashed password to match standard application flow
    const hashedUserOnePassword = await bcrypt.hash(userOne.password, 8)
    await new User({ ...userOne, password: hashedUserOnePassword }).save()
    
    // Create user 2
    const hashedUserTwoPassword = await bcrypt.hash(userTwo.password, 8)
    await new User({ ...userTwo, password: hashedUserTwoPassword }).save()

    // Insert Blogs
    await new Blogs(blogOne).save()
    await new Blogs(blogTwo).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    blogOneId,
    blogOne,
    blogTwoId,
    blogTwo,
    setupDatabase
}