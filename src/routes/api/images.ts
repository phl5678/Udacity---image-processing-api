import express from 'express';
import { promises as fsPromises } from 'fs';
import path from 'path';
import sharp from 'sharp';

const images = express.Router();

const imgFullPath = path.join('images', 'full');
const imgResizePath = path.join('images', 'thumb');

enum ImageType {
  jpg = 'jpg',
  png = 'png',
}

async function processImage(
  fromFilePath: string,
  width: number,
  height: number,
  toFilePath: string
) {
  let buffer = null;

  try {
    buffer = await sharp(fromFilePath)
      .resize(width, height)
      .toFile(toFilePath, (err, info) => {
        //TODO: error handling
        //throw new Error(err.message);
        console.log(`err: ${err}`);
      })
      .toBuffer();
  } catch (err) {
    //TODO: error handling
    throw new Error('test');
    console.log(err);
  }
  return buffer;
}

async function ifFileExist(filePath: string) {
  let file = null;

  try {
    file = await fsPromises.readFile(filePath);
  } catch (err) {
    //TODO: error handling
    console.log(err);
  }
  return file;
}

//TODO: currently accept .jpg only. add other formats.
async function imageProcessing(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const queryParams = req.query;
  const filename =
    'filename' in queryParams ? (queryParams.filename as string) : '';
  const width =
    'width' in queryParams ? parseInt(queryParams.width as string) || 0 : 0;
  const height =
    'height' in queryParams ? parseInt(queryParams.height as string) || 0 : 0;

  if (filename === '' || width <= 0 || height <= 0) {
    res.sendStatus(400);
    next();
    return;
  }

  const origFilePath = path.join(
    imgFullPath,
    `${filename}.${ImageType.jpg}`
  );
  const resizeFilePath = path.join(
    imgResizePath,
    `${filename}_${width}x${height}.${ImageType.jpg}`
  );

  try {
    //Check if the original full size image exists
    const origFile = await ifFileExist(origFilePath);
    if (origFile === null) {
        res.sendStatus(400);
        next();
        return;
    }

    //Check if the resize image exists
    const resizeFile = await ifFileExist(resizeFilePath);
    if (resizeFile !== null) {
      //send existing image file to the response.
      res.type('jpg');
      res.send(resizeFile);
    } else {
      //resize image, save to file, and send it to response.
      const buffer = await processImage(origFilePath, width, height, resizeFilePath);
      if (buffer !== null) {
        res.type('jpg');
        res.send(buffer);
      }
      else {
        res.sendStatus(500);
      }
    }
  } catch (err) {
    console.log(`imageProcessing: ${err}`);
  }
  next();
}

images.use('/', imageProcessing);

export default images;
