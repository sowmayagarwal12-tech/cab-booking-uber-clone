import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscribers = new Map();
    this.init();
  }

  init() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        console.log('STOMP WebSocket connected successfully');
        // Resubscribe active subscriptions
        this.subscribers.forEach((callbacks, topic) => {
          this._bindSubscription(topic, callbacks);
        });
      },
      onDisconnect: () => {
        this.connected = false;
        console.log('STOMP WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.warn('Broker reported error: ' + frame.headers['message']);
      },
      onWebSocketError: (event) => {
        console.warn('WebSocket connection error:', event);
      }
    });

    try {
      this.client.activate();
    } catch (e) {
      console.warn('Could not activate WebSocket client:', e);
    }
  }

  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);

    if (this.connected && this.client) {
      this._bindSubscription(topic, this.subscribers.get(topic));
    }

    // Return unbind function
    return () => {
      const callbacks = this.subscribers.get(topic);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(topic);
        }
      }
    };
  }

  _bindSubscription(topic, callbacks) {
    try {
      this.client.subscribe(topic, (message) => {
        try {
          const parsed = JSON.parse(message.body);
          callbacks.forEach((cb) => cb(parsed));
        } catch {
          callbacks.forEach((cb) => cb(message.body));
        }
      });
    } catch (err) {
      console.warn('Error binding subscription to ' + topic, err);
    }
  }

  send(destination, body) {
    if (this.connected && this.client) {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
