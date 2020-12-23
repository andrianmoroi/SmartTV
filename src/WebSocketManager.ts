import { Server } from "ws"

export class WebSocketManager {

  private wss: Server

  public constructor(private port: number) {
    this.wss = new Server({ port })

    this.wss.on('connection', ws => {
      console.log("new connection 2");

      (ws as any).isAlive = true;
      
      ws.on('pong', () => (ws as any).isAlive = true);
      
      ws.on('message', data => console.log(`Received message client: ${data}`))
    });

    let interval = setInterval(() => WebSocketManager.ping(this.wss), 30000);

    this.wss.on('close', function close() {
      clearInterval(interval);
    });

    this.wss.on('message', data => console.log(`Received message: ${data}`))
  }

  public sendMessage(message: string) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private static ping(wss : Server) {
    wss.clients.forEach(function each(ws) {
      if ((ws as any).isAlive === false) return ws.terminate();

      (ws as any).isAlive = false;
      ws.ping(() => { });
    });
  }

}