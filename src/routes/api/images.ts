import express, { Router } from 'express';
import { logger } from '../../index';
import {
  getImagePath,
  readImage,
  resizeImage,
  ImageType,
  imgFullPath,
  imgThumbPath,
} from './imagesUtil';

const images: Router = express.Router();

interface RequestQuery {
  filename?: string;
  width?: number;
  height?: number;
}
/**
 * Validate the query parameters, it should contain filename, width, and height.
 * @param queryParams request.query objecy casted as RequestQuery interface.
 * @returns filename, width, and height object literal as shape of RequestQuery or null if any of params is empty/0
 */
function validateQuery(queryParams: RequestQuery): RequestQuery | null {
  let filename =
    'filename' in queryParams ? (queryParams.filename as string) : '';
  let width: number =
    'width' in queryParams
      ? parseInt(queryParams.width as unknown as string)
      : 0;
  let height: number =
    'height' in queryParams
      ? parseInt(queryParams.height as unknown as string)
      : 0;

  filename = filename.toLowerCase();
  width = Number.isNaN(width) || width <= 0 ? 0 : width;
  height = Number.isNaN(height) || height <= 0 ? 0 : height;

  if (filename.length === 0 || width === 0 || height === 0) return null;

  return { filename, width, height } as RequestQuery;
}

/**
 * The middleware for processing image. The example url request, /api/images?filename=example&width=100&height=100
 * @param req http request
 * @param res http response
 * @param next the next function
 */
async function imageProcessing(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    logger.info('---Start image processing middleware---');

    //Validate the query
    const queryParams = validateQuery(req.query as unknown as RequestQuery);
    if (queryParams === null) {
      logger.error(`validateQuery error: invalid query parameters.`);
      throw new Error(
        'Invalid query parameters. Please provide valid filename (name without file extension), width (positive number), and height (positive number).'
      );
    }

    const origFilePath = getImagePath(
      queryParams.filename as string,
      ImageType.jpg,
      imgFullPath
    );
    const resizeFilePath = getImagePath(
      queryParams.filename as string,
      ImageType.jpg,
      imgThumbPath,
      queryParams.width,
      queryParams.height
    );

    logger.info(`Reading resize image: ${resizeFilePath}`);

    //Get the resize image if it exists. Otherwise resize and save to file.
    const resizeFile = await readImage(resizeFilePath);
    if (resizeFile !== null && resizeFile.byteLength !== 0) {
      //send existing image file to the response.
      logger.info('Resize file exists. Send directly to the response.');
      res.type('jpg');
      res.send(resizeFile);
    } else {
      //resize image, save to file, and send it to response.
      logger.info('Resize file not found. Resizing and saving to file.');
      const buffer = await resizeImage(
        origFilePath,
        queryParams.width,
        queryParams.height,
        resizeFilePath
      );

      if (buffer !== null && buffer.byteLength !== 0) {
        res.type('jpg');
        res.send(buffer);
        logger.info('Resized file saved and sent to response.');
      } else {
        logger.error(`resizeImage error: resize buffer returned null.`);
        throw new Error('Image cannot be resized. Please try again.');
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${err.name} - ${err.message}`);
      if (
        //User error
        err.message.startsWith('Input file is missing') ||
        err.message.startsWith('Invalid query parameters')
      ) {
        res.status(400).send(err.message);
      } else {
        //System error
        res.status(500).send(err.message);
      }
    }
  }
  logger.info('---Done image processing middleware---');
  next();
}

images.use('/', imageProcessing);

export { images as default, validateQuery, imageProcessing, RequestQuery };
