const express = require('express')
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const stringSlice = require('string-slice')

const userRouter = require('./routers/user')
const blogRouter = require('./routers/blog')

require('./db/mongoose')

const public = path.join(__dirname, '../public')
const partials = path.join(__dirname, '../templates/partials')
const view_path = path.join(__dirname, '../templates/views')

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    // console.log(arg2)
    // console.log(arg1.toString()===arg2.toString())
    // console.log('\n')
    return (arg1.toString() === arg2.toString()) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('trimDate', function(passedString) {
    var theString = stringSlice(passedString.toString(), 4, 16);
    return new hbs.SafeString(theString)
});


app = express()
app.set('view engine', 'hbs')
app.set('views', view_path)
hbs.registerPartials(partials)

app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser());
app.use(express.static(public))
app.use(express.json())
app.use(userRouter)
app.use(blogRouter)

module.exports = app