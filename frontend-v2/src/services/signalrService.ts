import * as signalR from '@microsoft/signalr';
import { config } from '../config';
import { getAuthToken } from '../utils/auth';

let connection: signalR.HubConnection | null = null;

export const startSignalR = async (clientId?: number, onReceive?: (data: any) => void) => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) return connection;

  const base = config.api.baseUrl.replace(/\/$/, '');
  const url = clientId ? `${base}/hubs/notifications?clientId=${clientId}` : `${base}/hubs/notifications`;
  const token = getAuthToken();
  const options = token ? { accessTokenFactory: () => token } as signalR.IHttpConnectionOptions : {} as signalR.IHttpConnectionOptions;
  connection = new signalR.HubConnectionBuilder()
    .withUrl(url, options)
    .withAutomaticReconnect()
    .build();

  connection.on('ReceiveNotification', (data: any) => {
    if (onReceive) onReceive(data);
  });

  await connection.start();
  return connection;
};

export const stopSignalR = async () => {
  if (connection) {
    await connection.stop();
    connection = null;
  }
};

export const subscribeClient = async (clientId: number) => {
  if (!connection) return;
  await connection.invoke('SubscribeClient', clientId);
};

export const unsubscribeClient = async (clientId: number) => {
  if (!connection) return;
  await connection.invoke('UnsubscribeClient', clientId);
};
