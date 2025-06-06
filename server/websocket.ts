import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage';

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export function setupWebSocket(webSocketServer: WebSocketServer) {
  wss = webSocketServer;

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send initial data
    sendStatsUpdate();
  });

  // Send periodic updates
  setInterval(() => {
    sendStatsUpdate();
  }, 5000);
}

export function broadcast(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        clients.delete(client);
      }
    }
  });
}

export async function sendStatsUpdate() {
  try {
    const stats = await storage.getLatestStats();
    const proxies = await storage.getAllProxies();
    const workingProxies = proxies.filter(p => p.isWorking);
    
    const updatedStats = {
      ...stats,
      proxiesOnline: workingProxies.length,
      totalProxies: proxies.length,
    };

    broadcast('stats-update', updatedStats);
  } catch (error) {
    console.error('Error sending stats update:', error);
  }
}

export function sendProgressUpdate(listId: number, progress: number) {
  broadcast('progress-update', { listId, progress });
}

export function sendActivityUpdate(activity: any) {
  broadcast('activity-update', activity);
}
