const socket = io()
let output = '';

//elements
const $messages = document.querySelector('#allMessages');
const $sidebar = document.querySelector('#sidebar');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


// on text new message
socket.on('newMessage', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text, 
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    document.getElementById("newMessage").play();
    autoScroll()
})

// on location message
socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
     });
    $messages.insertAdjacentHTML('beforeend', html);
    document.getElementById("newMessage").play()
    autoScroll()
})

// on room data
socket.on('roomData', ( { room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html;
})

// on joining new chat
socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error);
        location.href = '/'
    }
})



// handler functions

const autoScroll = () => {
    // new mesage element
    const $newMessage = $messages.lastElementChild;

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    // height of message conatainer
    const conatainerHeight = $messages.scrollHeight;

    // how far have I scrolled?
    const scrollOffest = $messages.scrollTop + visibleHeight;

    if(conatainerHeight - newMessageHeight <= scrollOffest){
        $messages.scrollTop = $messages.scrollHeight
    }
}

function sendMessage(e) {
    e.preventDefault();
    
    const $input = e.path[0][0];
    const $btn = e.path[0][1];

    // disabling btn
    $btn.setAttribute('disabled', 'disabled');

    let message = e.path[0][0].value
    socket.emit('sendMessage', message, (error) => {
        
        // renabling btn
        $btn.removeAttribute('disabled');
        $input.value = '';
        $input.focus();

        if(error){
            return alert(error)
        }
        console.log('Message Delivered')
    })
}

function shareLocation(e) {
    
    e.setAttribute('disabled', 'disabled');
    
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your Browser')
    }
    navigator.geolocation.getCurrentPosition((position)=> {
        console.log(position)

        socket.emit('shareLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {

            e.removeAttribute('disabled');
            console.log('Location Shared!')
        })
    })
}   