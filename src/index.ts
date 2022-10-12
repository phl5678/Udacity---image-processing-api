import express from 'express';
import routes from './routes/index';
import winston from 'winston';

const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: 'debug.log' })],
});

const app = express();
const port = 3000;

app.use('/api', routes);

app.listen(port, () => {
  logger.info(`server started at http://localhost:${port}`);
});

export { app as default, logger };
