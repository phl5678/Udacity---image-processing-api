import express, { Router } from 'express';
import images from './api/images';

const routes: Router = express.Router(); //CHANGED: Added the type

routes.get('/', (req: express.Request, res: express.Response): void => { //CHANGED: Added the type for the function parameter and return
  res.status(200).send('Access /api 200 OK.');
});

routes.use('/images', images);
export default routes;
