import aedes from 'aedes';
import { createServer } from 'net';
import { createServer as createHttpServer } from 'http';
import ws from 'websocket-stream';

const aedesBroker = aedes();
const server = createServer(aedesBroker.handle);
const httpServer = createHttpServer();

ws.createServer({ server: httpServer }, aedesBroker.handle);

server.listen(1883, function () {
  console.log('MQTT Broker listening on port 1883 (TCP)');
});

httpServer.listen(9001, function () {
  console.log('MQTT Broker listening on port 9001 (WebSocket/WS)');
  console.log('Ready for local network offline chat!');
});
