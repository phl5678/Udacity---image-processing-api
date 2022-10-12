"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const imagesUtil_1 = require("../../../routes/api/imagesUtil");
describe('routes/api/imagesUtilSpec.js', () => {
    const fullPath = path_1.default.join(__dirname, '..', '..', '..', '..', 'images', 'full');
    const thumbPath = path_1.default.join(__dirname, '..', '..', '..', '..', 'images', 'thumb');
    describe('ifImageExists(): Check if the file exists.', () => {
        it('should return true if the file exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'palmtunnel';
            const filePath = (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath);
            const file = yield (0, imagesUtil_1.ifImageExists)(filePath);
            expect(file).toBeTrue();
        }));
        it('should return false when the file does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'teastazse';
            const filePath = (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath);
            const file = yield (0, imagesUtil_1.ifImageExists)(filePath);
            expect(file).toBeFalse();
        }));
    });
    describe('readImage(): read the image file', () => {
        it('should return file buffer if the image exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'fjord';
            const filePath = (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath);
            const file = yield (0, imagesUtil_1.readImage)(filePath);
            expect(file).toBeInstanceOf(Buffer);
        }));
        it('should return null when the image does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'tqawekjag';
            const filePath = (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath);
            const file = yield (0, imagesUtil_1.readImage)(filePath);
            expect(file).toBeNull();
        }));
    });
    describe('getImagePath(): get normalized complete file path ', () => {
        it('should return (root)/images/full/icelandwaterfall.jpg', () => {
            const filename = 'icelandwaterfall';
            expect((0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath)).toContain(path_1.default.normalize('/images/full/icelandwaterfall.jpg'));
        });
        it('should return (root)/images/thumb/icelandwaterfall_100x100.jpg', () => {
            const filename = 'icelandwaterfall';
            const width = 100;
            const height = 100;
            expect((0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, thumbPath, width, height)).toContain(path_1.default.normalize('/images/thumb/icelandwaterfall_100x100.jpg'));
        });
        it('should return (root)/images/full/icelandwaterfall.jpg when width is set but height is not', () => {
            const filename = 'icelandwaterfall';
            const width = 100;
            expect((0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath, width)).toContain(path_1.default.normalize('/images/full/icelandwaterfall.jpg'));
        });
        it('should throw error when filename is empty', () => {
            const filename = '';
            expect(function () {
                (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath);
            }).toThrowError(Error);
        });
    });
    describe('resizeImage(): resize an jpg image ', () => {
        it('should return file buffer', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'icelandwaterfall';
            const fromFile = (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath);
            const width = 100;
            const height = 100;
            const toFile = (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, thumbPath, width, height);
            const buffer = yield (0, imagesUtil_1.resizeImage)(fromFile, width, height, toFile);
            expect(buffer).toBeInstanceOf(Buffer);
        }));
        it('should return null when the full size file does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'qwtrasdr';
            const fromFile = (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, fullPath);
            const width = 100;
            const height = 100;
            const toFile = (0, imagesUtil_1.getImagePath)(filename, imagesUtil_1.ImageType.jpg, thumbPath, width, height);
            const buffer = yield (0, imagesUtil_1.resizeImage)(fromFile, width, height, toFile);
            expect(buffer).toBeNull();
        }));
    });
});
