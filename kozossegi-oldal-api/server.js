const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const socketIO = require('socket.io');
const http = require('http');
const compression = require('compression');

const db = require('./db'); // Ki lehet kommentezni ezt a sor, ha nem szeretnénk, hogy az adatbázis resetelődjön a szerver indulásakor.
const scheduled = require('./middleware/scheduled');
const schools = require('./middleware/schools/schools');
const home = require('./middleware/home');
const authJwt = require('./middleware/authJwt');

const fileUpload = require('express-fileupload');

const app = express();
const port = 8000 || process.env.port;

var corsOptions = {
  origin: true
};

const usersRouter = require('./routes/users.routes');
const authRouter = require('./routes/auth.routes');
const surveysRouter = require('./routes/surveys.routes');
const notesRouter = require('./routes/notes.routes');
const quizzesRouter = require('./routes/quizzes.routes');
const notificationsRouter = require('./routes/notifications.routes');
const messagesRouter = require('./routes/messages.routes');

app.use(compression());

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

app.use(fileUpload());
app.use(express.static('uploads'));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/surveys', surveysRouter);
app.use('/api/notes', notesRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/messages', messagesRouter);

app.get('/api/schools', (req, res) => {
  res.send(schools.getSchools());
});

app.get('/api/home', [authJwt.verifyToken], home.getHomeData);

cron.schedule('*/5 * * * *', function () {
  scheduled.clearBlackList();
  scheduled.clearSecureCodes();
});

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://localhost:${port}`)
});

const notiServer = http.createServer(app)
const io = socketIO(notiServer, {
  path: '/notification/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
require('./controllers/notification.socket')(io);

const notiPort = 8080;

notiServer.listen(notiPort, '0.0.0.0', () => {
  console.log(`Notification system running on http://localhost:${notiPort}`)
})

const msgServer = http.createServer(app)
const msgIo = socketIO(msgServer, {
  path: '/message/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
require('./controllers/message.socket')(msgIo);

const msgPort = 8008;

msgServer.listen(msgPort, '0.0.0.0', () => {
  console.log(`Messages system running on http://localhost:${msgPort}`)
})