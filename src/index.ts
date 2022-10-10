import express from 'express';
import { promises as fsPromises } from 'fs';
import path from 'path';
import sharp from 'sharp';

const app = express();
const port = 3000;
const imgFullPath = path.join(__dirname, '..', 'images', 'full');
const imgResizePath = path.join(__dirname, '..', 'images', 'thumb');

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
        console.log(`err: ${err}`);
        console.log(`info: ${info}`);
      })
      .toBuffer();
  } catch (err) {
    //TODO: error handling
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
    'width' in queryParams
      ? parseInt(queryParams.width as string)
      : 0;
  const height =
    'height' in queryParams
      ? parseInt(queryParams.height as string)
      : 0;

  if (filename === '' || width === 0 || height === 0) {
    //TODO: error handling
    return;
  }


  const filePath = path.join(
    imgResizePath,
    `${filename}_${width}x${height}.${ImageType.jpg}`
  );
  const file = await ifFileExist(filePath);
  if (file !== null) { //send existing image file to the response.
    res.type('jpg');
    res.send(file);
  } else { //resize image, save to file, and send it to response.
    const fromFilePath = path.join(imgFullPath, `${filename}.${ImageType.jpg}`);
    const buffer = await processImage(fromFilePath, width, height, filePath);
    if (buffer !== null) {
      res.type('jpg');
      res.send(buffer);
    }
  }
  next();
}

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

app.use('/api/images', imageProcessing);
