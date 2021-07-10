const genMsg = (text)=>{
    return {
        text:text.message,
        name: text.myname,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    genMsg
}