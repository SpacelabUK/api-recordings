
const { wireUpApp } = require('./dependency_injection/app_wiring');
const { getConfigForEnvironment } = require('./config/config.js');
const { wrapperToHandleUnhandledExceptions } = require('./services/error_handling/logger/logger.js');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

let config;
let diContainer;
let app;

const configureRouting = () => {
  const routes = diContainer.getDependency('routes');
  app.use('/', routes);

  app.use(cors());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
};

const setUpErrorHandler = () => {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      error: {
        message: err.message,
      },
    });
  });
};

const setUpWebServer = () => {
  app = express();

  configureRouting();

  setUpErrorHandler();

  app.listen(config.webServer.port);
};

const connectToDatabase = () =>
  mongoose.connect(config.recordingDatabase.uri, { useNewUrlParser: true });

const startApp = async () => {
  try {
    diContainer = wireUpApp();

    config = getConfigForEnvironment(process.env.NODE_ENV);

    setUpWebServer();

    await connectToDatabase();
  } catch (error) {
    console.log(error);
  }
};


wrapperToHandleUnhandledExceptions(() => {
  startApp();
});

module.exports = app;
