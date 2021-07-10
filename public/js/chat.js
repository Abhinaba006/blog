
const socket = io()

const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML

const $messageForm = document.querySelector('#message-form')
let $messageFormInput = $messageForm.querySelector('input')
const $messageFormBtn = $messageForm.querySelector('button')

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
    // const html = Mustache.render(messageTemplate, msg)
    // console.log(html)
    // $messages.insertAdjacentHTML('afterend', html)
// })

$messageForm.addEventListener('submit', (e)=>{
    $messageFormBtn.setAttribute('disabled', 'disabled')
    e.preventDefault()
    const message = e.target.elements.message.value
    const myname = document.querySelector('#myname').textContent
    socket.emit('chat', {message, myname}, (e)=>{
        console.log('msg sent')
        $messageFormBtn.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus ()
        if(e)   console.log(e)
        else console.log('done')
    })
})

