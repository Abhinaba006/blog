
const socket = io()

const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message-input')
const $messageFormBtn = document.querySelector('#message-send')

$messageFormInput.addEventListener('input', () => {
    const value = $messageFormInput.value.trim()
    const isEmpty = value.length === 0
    $messageFormBtn.disabled = isEmpty
})

const isMessageValid = (text) => {
    return typeof text === 'string' && text.trim().length > 0
}

// send message
socket.on('chat', (msg)=>{
    try {
        const message = document.createElement('div')
        message.innerHTML = messageTemplate
        message.querySelector('.name').textContent = 'by '+msg.name
        message.querySelector('.text').textContent = msg.text
        message.querySelector('.time').textContent = moment(msg.createdAt).fromNow()
        $messages.appendChild(message)
    } catch (error) {
        console.error('Error rendering chat message:', error)
    }
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
    const myname = document.querySelector('#name').textContent.split('as ')[1].trim()
    socket.emit('chat', {message, myname}, (err)=>{
        if(err) {
            console.error('Error sending message:', err)
        }
        $messageFormInput.value = ''
        $messageFormBtn.disabled = true
        $messageFormInput.focus()
    })
})

