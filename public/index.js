var socket = io();
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const r = document.getElementById('messageBoard');
const bottomButton = document.getElementById('bottomButton')

function toggleAnounceVis(val){
    r.style.setProperty('--announcementVisibility', (val) ? 1 : 0);
    setTimeout(() => {  check();    }, 600);
}



lastMessageID = '';
var user = {
    "id" : undefined,
    "username" : undefined
};

function addMessage(msg, socketID) {
    if(lastMessageID == socketID){
        let MessageTarget = messages.childNodes[messages.childNodes.length - 1];
        let item = document.createElement('p');
        item.textContent = msg;
        MessageTarget.appendChild(item)
    } else {
        let item = document.createElement('li');
        item.textContent = msg;
        item.classList.add('msg');

        if(socketID != socket.id)
            item.classList.add('other')
        lastMessageID = socketID;
        messages.appendChild(item);
    }
    scrollToBottom();
}

function addAnnouncement(msg) {
    let item = document.createElement('li');
    item.textContent = `${msg}`;
    item.classList.add('announcement');

    messages.appendChild(item);
    scrollToBottom();
    lastMessageID = 'none';
}

function scrollToBottom(){
    window.scrollTo(0, r.scrollHeight);
}

function check(){
    if(window.scrollY < r.scrollHeight - 1100){
        bottomButton.style.filter = 'opacity(1)';
    } else {
        bottomButton.style.filter = 'opacity(0)';
    }
}

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        addMessage(input.value, socket.id);
        input.value = '';
    }
});
socket.on('announce', (msg)=>{
    addAnnouncement(msg);
});
socket.on('chat message', (msg, isOther) => {
    addMessage(msg, isOther);
});
socket.on('connect', () => {
});
socket.on('history', (data) => {
    // console.log(data);
    for(let iter of data){
        switch (iter.slice(0,3)) {
            case 'MSG':
                if(iter.length > 0)
                    addMessage(iter.slice(25, iter.length), iter.split('::')[0]);
                break;
            default:
                addAnnouncement(iter.slice(3,iter.length))
                break;
        }
    }
lastMessageID = data[data.length - 1].split('::')[0];
console.log(r.offsetHeight);
scrollToBottom();
check();
});
socket.on('error', (err) => {
    console.log('there was an error', err);
}); 