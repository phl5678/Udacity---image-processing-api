import path from 'path';
import {
  ifImageExists,
  getImagePath,
  readImage,
  resizeImage,
  ImageType,
} from '../../../routes/api/imagesUtil';

describe('routes/api/imagesUtilSpec.js', () => {
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
  describe('ifImageExists(): Check if the file exists.', () => {
    it('should return true if the file exists', async () => {
      const filename = 'palmtunnel';
      const filePath = getImagePath(filename, ImageType.jpg, fullPath);

      const file = await ifImageExists(filePath);
      expect(file).toBeTrue();
    });
    it('should return false when the file does not exist', async () => {
      const filename = 'teastazse';
      const filePath = getImagePath(filename, ImageType.jpg, fullPath);
      const file = await ifImageExists(filePath);
      expect(file).toBeFalse();
    });
  });

  describe('readImage(): read the image file', () => {
    it('should return file buffer if the image exists', async () => {
      const filename = 'fjord';
      const filePath = getImagePath(filename, ImageType.jpg, fullPath);
      const file = await readImage(filePath);
      expect(file).toBeInstanceOf(Buffer);
    });
    it('should return null when the image does not exist', async () => {
      const filename = 'tqawekjag';
      const filePath = getImagePath(filename, ImageType.jpg, fullPath);
      const file = await readImage(filePath);
      expect(file).toBeNull();
    });
  });

  describe('getImagePath(): get normalized complete file path ', () => {
    it('should return (root)/images/full/icelandwaterfall.jpg', () => {
      const filename = 'icelandwaterfall';
      expect(getImagePath(filename, ImageType.jpg, fullPath)).toContain(
        path.normalize('/images/full/icelandwaterfall.jpg')
      );
    });
    it('should return (root)/images/thumb/icelandwaterfall_100x100.jpg', () => {
      const filename = 'icelandwaterfall';
      const width = 100;
      const height = 100;
      expect(
        getImagePath(filename, ImageType.jpg, thumbPath, width, height)
      ).toContain(path.normalize('/images/thumb/icelandwaterfall_100x100.jpg'));
    });

    it('should return (root)/images/full/icelandwaterfall.jpg when width is set but height is not', () => {
      const filename = 'icelandwaterfall';
      const width = 100;
      expect(getImagePath(filename, ImageType.jpg, fullPath, width)).toContain(
        path.normalize('/images/full/icelandwaterfall.jpg')
      );
    });
    it('should throw error when filename is empty', () => {
      const filename = '';
      expect(function () {
        getImagePath(filename, ImageType.jpg, fullPath);
      }).toThrowError(Error);
    });
  });

  describe('resizeImage(): resize an jpg image ', () => {
    it('should return file buffer', async () => {
      const filename = 'icelandwaterfall';
      const fromFile = getImagePath(filename, ImageType.jpg, fullPath);
      const width = 100;
      const height = 100;
      const toFile = getImagePath(
        filename,
        ImageType.jpg,
        thumbPath,
        width,
        height
      );
      const buffer = await resizeImage(fromFile, width, height, toFile);
      expect(buffer).toBeInstanceOf(Buffer);
    });
    it('should return null when the full size file does not exist', async () => {
      const filename = 'qwtrasdr';
      const fromFile = getImagePath(filename, ImageType.jpg, fullPath);
      const width = 100;
      const height = 100;
      const toFile = getImagePath(
        filename,
        ImageType.jpg,
        thumbPath,
        width,
        height
      );
      const buffer = await resizeImage(fromFile, width, height, toFile);
      expect(buffer).toBeNull();
    });
  });
});
