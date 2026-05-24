
const socket = io()

const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message-input')
const $messageFormBtn = document.querySelector('#message-send')

$messageFormInput.addEventListener('input', () => {
    const value = $messageFormInput.value.trim()
    $messageFormBtn.disabled = value.length === 0
})

const isMessageValid = (text) => {
    return typeof text === 'string' && text.trim().length > 0
}

// send message
socket.on('chat', (msg)=>{
    // console.log('hi ', msg)
    const message = document.createElement('div')
    message.innerHTML = messageTemplate
    console.log(msg)
    message.querySelector('.name').textContent = 'by '+msg.name
    message.querySelector('.text').textContent = msg.text
    message.querySelector('.time').textContent = moment(msg.createdAt).fromNow()

    $messages.appendChild(message)
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const message = $messageFormInput.value
    if (!isMessageValid(message)) {
        $messageFormInput.value = ''
        $messageFormBtn.disabled = true
        return
    }

    $messageFormBtn.disabled = true
    const myname = document.querySelector('#myname').textContent
    socket.emit('chat', {message, myname}, (err)=>{
        console.log('msg sent')
        $messageFormInput.value = ''
        $messageFormBtn.disabled = true
        $messageFormInput.focus()
        if(err) console.log(err)
        else console.log('done')
    })
})

