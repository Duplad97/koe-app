import { io } from 'socket.io-client';

const host = window.location.hostname;

export const msgSocket = io(`http://${host}:8008`, {
  path: "/message/",
  origin: "http://localhost:3000"
});

/*export const msgSocket = io("http://192.168.1.7:8008", {
  path: "/message/",
  origin: "http://localhost:3000"
});*/