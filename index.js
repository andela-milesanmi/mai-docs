import express from 'express';
import path from 'path';
import webpack from 'webpack';
import logger from 'morgan';
import log from 'npmlog';
import bodyParser from 'body-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import serverRoutes from './server/routes';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// swagger definition
const swaggerDefinition = {
  info: {
    title: 'Mai Docs',
    version: '1.0.0',
    description: 'Your very own Document Management System'
  },
  host: 'localhost:8080',
  basePath: '/'
};

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the API docs
  apis: ['./server/routes/index.js']
};

const PORT = isTest ? 4444 : process.env.PORT || 8080;

if (!isTest) {
  // initialize swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(options);

  // serve swagger
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

if (!isProd && !isTest) {
  /*eslint-disable global-require*/
  const webpackConfig = require('./webpack.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: '/'
  }));
  app.use(webpackHotMiddleware(compiler));
}

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// connect server routes.
serverRoutes(app);

app.use(express.static(path.join(__dirname, '/dist/')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});

app.listen(PORT, () => {
  log.info('==> 🌎 Listening on PORT %s.', PORT);
});

export default app;
