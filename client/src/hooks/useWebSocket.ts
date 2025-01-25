import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}`);

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);

          queryClient.setQueryData(['/api/tasks'], (oldData: any[] = []) => {
            switch (update.type) {
              case 'CREATE':
                return [...oldData, update.task];
              case 'UPDATE':
                return oldData.map(task => 
                  task.id === update.task.id ? update.task : task
                );
              case 'DELETE':
                return oldData.filter(task => task.id !== update.task.id);
              default:
                return oldData;
            }
          });
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        // Attempt to reconnect after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [queryClient]);
}