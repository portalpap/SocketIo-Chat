const express = require('express');
const app     = express();
const http    = require('http').createServer(app);
const io      = require('socket.io')(http);
const fs      = require('fs');

const serverLog = fs.createWriteStream('public/session.txt');

const port = process.env.PROT ?? 3000;

app.use(express.static('public'));

function readSessionFile(){
  try {  
    var data = fs.readFileSync('public/session.txt', 'utf8');
    return data.toString();    
  } catch(e) {
    console.log(`Error: `, e.stack);
    return `false`
  }
}
function LoadSession(socket) {
  const data = readSessionFile();
  if(data !== false){
      let splitData = data.split('\n')

      io.to(socket.id).emit('history', splitData);
  } else {
    console.log('couldn\'t recive valid data');
  }
}

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      serverLog.write(`MSG${socket.id}::${msg}\n`);

      socket.broadcast.emit('chat message', msg, socket.id);
    });

    console.log('a user connected ' + socket.id);

    socket.broadcast.emit('announce', `${socket.id} has joined`);

    LoadSession(socket);

    socket.on('disconnect', () => {
      serverLog.write(`ANC${socket.id}:: has left\n`);

      socket.broadcast.emit(`announce`, `-${socket.id} has left`);

      console.log(`user disconnected ${socket.id}`);
    });
  });

http.listen(port, () => {
  console.log(`listening on port:${port}`);
});