import { promises as fsPromises } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../../index';

const imgFullPath: string = path.join(__dirname, '../../../', 'images', 'full');
const imgThumbPath: string = path.join(
  __dirname,
  '../../../',
  'images',
  'thumb'
);

enum ImageType {
  jpg = 'jpg',
  png = 'png',
}

/**
 * Get the complete file name with type extension. If both width and height have value, add the width/height info into the filename.
 * @param filename image filename without type extension
 * @param type type extension
 * @param filepath the file path to images/full or images/thumb
 * @param width (optional) width of the image.
 * @param height (optional) height of the image
 * @returns normalized file name
 */
function getImagePath(
  filename: string,
  type: ImageType,
  filepath: string,
  width?: number,
  height?: number
): string {
  if (filename.length === 0) {
    logger.error('getFileName(): Filename must not be empty string.');
    throw new Error('Filename must not be empty string.');
  }

  return width !== undefined && height !== undefined
    ? path.join(
        filepath,
        `${filename.toLowerCase()}_${width}x${height}.${type}`
      )
    : path.join(filepath, `${filename.toLowerCase()}.${type}`); //ignore width and height in the file name if only width or only height is passed.
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

export {
  getImagePath,
  ifImageExists,
  readImage,
  resizeImage,
  ImageType,
  imgFullPath,
  imgThumbPath,
};
