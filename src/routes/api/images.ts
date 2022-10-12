import express, { Router } from 'express';
import { promises as fsPromises } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../../index';

const images: Router = express.Router();

const imgFullPath: string = path.join(__dirname, '../../../', 'images', 'full');
const imgResizePath: string = path.join(
  __dirname,
  '../../../',
  'images',
  'thumb'
);

enum ImageType {
  jpg = 'jpg',
  png = 'png',
}

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
 * Get the complete file name with type extension. If both width and height have value, add the width/height info into the filename.
 * @param filename filename without type extension
 * @param type type extension
 * @param width (optional) width of the image.
 * @param height (optional) height of the image
 * @returns normalized file name
 */
function getFileName(
  filename: string,
  type: ImageType,
  width?: number,
  height?: number
): string {
  if (filename.length === 0) {
    logger.error('getFileName(): Filename must not be empty string.');
    throw new Error('Filename must not be empty string.');
  }

  if (width !== undefined && height !== undefined) {
    return `${filename.toLowerCase()}_${width}x${height}.${ImageType.jpg}`;
  } else {
    //ignore width and height in the file name if only width or only height is passed.
    return `${filename.toLowerCase()}.${ImageType.jpg}`;
  }
}

/**
 * A promise that checks if a file exists and can be read.
 * @param filePath the full path of the image file.
 * @returns True if the file exists, false otherwise.
 */
async function ifImageExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.access(filePath, fsPromises.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * A Promise that read the entire image file
 * @param filePath the full path of the image file.
 * @returns the file content buffer or null if file not found.
 */
async function readImage(filePath: string): Promise<Buffer | null> {
  if (filePath.length === 0) return null;

  try {
    return await fsPromises.readFile(filePath);
  } catch (err) {
    if (err instanceof Error) {
      if (!err.message.startsWith('ENOENT')) {
        logger.error(`fsPromises.readFile error: ${err.message}`);
        throw new Error(`fsPromises.readFile error: ${err.message}`);
      }
      //Do not throw errors for file not exist. Just silently log the error.
      logger.info(`Resize image not found: ${err.name}- ${err.message}`);
    }
    return null;
  }
}

/**
 * A promise that resizes the image to specific width and height using Sharp. This saves the resized image into a new file and returns the resized image buffer.
 * @param fromFilePath the full path of the original full size image
 * @param width the resized width. must greater than 0.
 * @param height the resized height. must greater than 0.
 * @param toFilePath the full path including file name that you want to save the resized image to.
 * @returns Promise<buffer> the file content in buffer if it's successfully resized or null if error.
 */
async function resizeImage(
  fromFilePath: string,
  width: number | undefined,
  height: number | undefined,
  toFilePath: string
): Promise<Buffer | null> {
  if (fromFilePath.length === 0 || toFilePath.length === 0) return null;
  try {
    return await sharp(fromFilePath)
      .resize(width, height)
      .toFile(toFilePath, (err) => {
        if (err !== null) {
          logger.error(`sharp.toFile error: ${err.name}- ${err.message}`);
        }
      })
      .toBuffer();
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`processImage error: ${err.name}- ${err.message}`);
    }
    return null;
  }
}

/**
 * The middleware for processing image. The example url request, /api/images?filename=example&width=100&height=100
 * @param req http request
 * @param res http response
 * @param next the next
 */
async function imageProcessing(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    logger.info('Start image processing middleware');

    //Validate the query
    const queryParams = validateQuery(req.query as unknown as RequestQuery);
    if (queryParams === null) {
      res.status(400).end();
      logger.error(`validateQuery error: invalid query parameters.`);
      return;
    }

    const origFilePath = path.join(
      imgFullPath,
      getFileName(queryParams.filename as string, ImageType.jpg)
    );
    const resizeFilePath = path.join(
      imgResizePath,
      getFileName(
        queryParams.filename as string,
        ImageType.jpg,
        queryParams.width,
        queryParams.height
      )
    );
    logger.info(`Input file path: ${origFilePath}`);
    logger.info(`Output file path: ${resizeFilePath}`);

    //Check if the original full size image exists
    const ifExists = await ifImageExists(origFilePath);
    if (!ifExists) {
      res.status(400).end();
      logger.error(
        `ifFileExist error: full size image does not exist. ${origFilePath}`
      );
      return;
    }

    //Get the resize image if it exists. Otherwise resize and save to file.
    const resizeFile = await readImage(resizeFilePath);
    if (resizeFile !== null && resizeFile.byteLength !== 0) {
      //send existing image file to the response.
      logger.info('Resize file exists. Send directly to the response.');
      res.type('jpg');
      res.send(resizeFile).end();
    } else {
      //resize image, save to file, and send it to response.
      logger.info(
        'Resize file not found. Resize, save to file, and send to the response.'
      );
      const buffer = await resizeImage(
        origFilePath,
        queryParams.width,
        queryParams.height,
        resizeFilePath
      );

      if (buffer !== null) {
        res.type('jpg');
        res.send(buffer).end();
      } else {
        res.status(500).end();
        logger.error(
          `resizeImage error: resize buffer is null. ${resizeFilePath}.`
        );
      }
    }
  } catch (err) {
    res.status(400).end();
    if (err instanceof Error) {
      logger.error(`imageProcessing: ${err.name}- ${err.message}`);
    }
  }
  logger.info('Done image processing middleware.');
  next();
}

images.use('/', imageProcessing);

export {
  images as default,
  validateQuery,
  ifImageExists,
  getFileName,
  readImage,
  resizeImage,
  imageProcessing,
  RequestQuery,
  ImageType,
};
