const express = require('express');
const ws = require('ws');

const app = express();

// in-memory store
const hashmap = {};

const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', socket => {
  socket.on('message', message => {
    const [cmd, arg1, arg2 ] = message.toString().split(' ');

    switch (cmd) {
      case "get": {
        socket.send(hashmap[arg1]);
        break;
      }

      case "add"||"upd": {
        if (hashmap[arg1] && cmd === "add") {
          socket.send("ERR: Key already exists, use `upd` command");
        } else if (!hashmap[arg1]) {
          hashmap[arg1] = arg2;
          socket.send(`${cmd} ${arg1}`);
        } else {
          socket.send("ERR: Key doesn't exist, use `add` command");
        }
        break;
      }

      case "del": {
        delete hashmap[arg1];
        socket.send(`${cmd} ${arg1}`);
        break;
      }

      default: {
        socket.send("ERR: Unknown command");
      }
    }
  });
});

const server = app.listen(3000);

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});


