// Disable WebSocket connections for development
if (import.meta.env.DEV) {
  // Prevent WebSocket connections
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function() {
    console.warn('WebSocket disabled for development - not needed for this app');
    return null as any;
  } as any;
  
  // Also disable EventSource for SSE
  const originalEventSource = window.EventSource;
  window.EventSource = function() {
    console.warn('EventSource disabled for development - not needed for this app');
    return null as any;
  } as any;
}