import { io } from 'socket.io-client';

const host = window.location.hostname;

export const socket = io(`http://${host}:8080`, {
  path: "/notification/",
  origin: "http://localhost:3000"
});

/*export const socket = io("http://192.168.1.7:8080", {
  path: "/notification/",
  origin: "http://localhost:3000"
});*/