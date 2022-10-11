import supertest from 'supertest';
import app from '../../../index';
import path from 'path';
import {
  validateQuery,
  ifImageExists,
  getFileName,
  readImage,
  resizeImage,
  RequestQuery,
  ImageType,
} from '../../../routes/api/images';

describe('routes/api/imagesSpec.js', () => {
  describe('validateQuery(): validate the request query parameters ', () => {
    it('should return object {filename, width, height} with lowercase file name, greater than 0 width and height.', () => {
      const query = {
        filename: 'FersdsFDs',
        width: '100',
        height: '100',
      } as unknown as RequestQuery;
      const data = validateQuery(query);
      expect(data).not.toBeNull();
      expect(data?.filename).toMatch(/[^A-Z]/);
      expect(data?.width).toBeGreaterThanOrEqual(0);
      expect(data?.height).toBeGreaterThanOrEqual(0);
    });
    it('should return null when filename is not present', () => {
      const query = {
        width: '100',
        height: '100',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when width is not present', () => {
      const query = {
        filename: 'FersdsFDs',
        height: '100',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when height is not present', () => {
      const query = {
        filename: 'FersdsFDs',
        width: '100',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when file name is empty string', () => {
      const query = {
        filename: '',
        width: '100',
        height: '100',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when width is negative number', () => {
      const query = {
        filename: 'FersdsFDs',
        width: '-100',
        height: '100',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when width is NaN', () => {
      const query = {
        filename: 'FersdsFDs',
        width: 'teq3r',
        height: '100',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when width is 0', () => {
      const query = {
        filename: 'FersdsFDs',
        width: '0',
        height: '100',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when height is negative number', () => {
      const query = {
        filename: 'FersdsFDs',
        width: '100',
        height: '-100',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when height is NaN', () => {
      const query = {
        filename: 'FersdsFDs',
        width: '100',
        height: 'rwert',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
    it('should return null when height is 0', () => {
      const query = {
        filename: 'FersdsFDs',
        width: '100',
        height: '0',
      } as unknown as RequestQuery;
      expect(validateQuery(query)).toBeNull();
    });
  });

  describe('ifImageExists(): Check if the file exists.', () => {
    const fullPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'images',
      'full'
    );

    it('should return true if the file exists', async () => {
      const filename = 'palmtunnel';
      const filePath = path.join(
        fullPath,
        getFileName(filename, ImageType.jpg)
      );

      const file = await ifImageExists(filePath);
      expect(file).toBeTrue();
    });
    it('should return false when the file does not exist', async () => {
      const filename = 'teastazse';
      const filePath = path.join(
        fullPath,
        getFileName(filename, ImageType.jpg)
      );
      const file = await ifImageExists(filePath);
      expect(file).toBeFalse();
    });
  });

  describe('readImage(): read the image file', () => {
    const fullPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'images',
      'full'
    );

    it('should return file buffer if the image exists', async () => {
      const filename = 'fjord';
      const filePath = path.join(
        fullPath,
        getFileName(filename, ImageType.jpg)
      );
      const file = await readImage(filePath);
      expect(file).toBeInstanceOf(Buffer);
    });
    it('should return null when the image does not exist', async () => {
      const filename = 'tqawekjag';
      const filePath = path.join(
        fullPath,
        getFileName(filename, ImageType.jpg)
      );
      const file = await readImage(filePath);
      expect(file).toBeNull();
    });
  });
  describe('getFileName(): get normalized complete file name ', () => {
    it('should return filename.jpg', () => {
      const filename = 'icelandwaterfall';
      expect(getFileName(filename, ImageType.jpg)).toBe('icelandwaterfall.jpg');
    });
    it('should return icelandwaterfall_100x100.jpg', () => {
      const filename = 'icelandwaterfall';
      const width = 100;
      const height = 100;
      expect(getFileName(filename, ImageType.jpg, width, height)).toBe(
        'icelandwaterfall_100x100.jpg'
      );
    });
    it('should throw error when filename is empty', () => {
      const filename = '';
      expect(function () {
        getFileName(filename, ImageType.jpg);
      }).toThrowError(Error);
    });
    it('should return filename.jpg when width is set but height is not', () => {
      const filename = 'icelandwaterfall';
      const width = 100;
      expect(getFileName(filename, ImageType.jpg, width)).toBe(
        'icelandwaterfall.jpg'
      );
    });
  });
  describe('resizeImage(): resize an jpg image ', () => {
    const fullPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'images',
      'full'
    );
    const thumbPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'images',
      'thumb'
    );
    it('should return file buffer', async () => {
      const filename = 'icelandwaterfall';
      const fromFile = path.join(
        fullPath,
        getFileName(filename, ImageType.jpg)
      );
      const width = 100;
      const height = 100;
      const toFile = path.join(
        thumbPath,
        getFileName(filename, ImageType.jpg, width, height)
      );
      const buffer = await resizeImage(fromFile, width, height, toFile);
      expect(buffer).toBeInstanceOf(Buffer);
    });
    it('should return null when the full size file does not exist', async () => {
      const filename = 'qwtrasdr';
      const fromFile = path.join(
        fullPath,
        getFileName(filename, ImageType.jpg)
      );
      const width = 100;
      const height = 100;
      const toFile = path.join(
        thumbPath,
        getFileName(filename, ImageType.jpg, width, height)
      );
      const buffer = await resizeImage(fromFile, width, height, toFile);
      expect(buffer).toBeNull();
    });
  });

  describe('/api/images?filename={filename}&width={width}&height={width}', () => {
    const request = supertest(app);
    it('should return 400 when requesting without any query parameters', () => {
      request.get('/api/images').expect(400);
    });
    it('should return resized image with image/jpeg content type', async () => {
      const filename = 'encenadaport';
      const width = 100;
      const height = 100;
      const url = `/api/images?filename=${filename}&width=${width}&height=${height}`;
      await request.get(url).expect('Content-Type', /image/);
    });

    it('should return 400 page when filename is empty', async () => {
      const width = 100;
      const height = 100;
      const url = `/api/images?width=${width}&height=${height}`;
      await request.get(url).expect(400);
    });
    it('should return 400 page when width is empty', async () => {
      const filename = 'encenadaport';
      const height = 500;
      const url = `/api/images?filename=${filename}&height=${height}`;
      await request.get(url).expect(400);
    });
    it('should return 400 page when height is empty', async () => {
      const filename = 'encenadaport';
      const width = 500;
      const url = `/api/images?filename=${filename}&width=${width}`;
      await request.get(url).expect(400);
    });
    it('should return 400 page when file does not exist', async () => {
      const filename = 'randomname';
      const width = 500;
      const height = 500;
      const url = `/api/images?filename=${filename}&width=${width}&height=${height}`;
      await request.get(url).expect(400);
    });
    it('should return 500 page when image resizing failed (ex. extremely large width, height)', async () => {
      const filename = 'santamonica';
      const width = 500000;
      const height = 500000;
      const url = `/api/images?filename=${filename}&width=${width}&height=${height}`;
      await request.get(url).expect(500);
    });
  });
});
