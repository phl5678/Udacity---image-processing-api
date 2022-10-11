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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const path_1 = __importDefault(require("path"));
const images_1 = require("../../../routes/api/images");
describe('routes/api/imagesSpec.js', () => {
    describe('validateQuery(): validate the request query parameters ', () => {
        it('should return object {filename, width, height} with lowercase file name, greater than 0 width and height.', () => {
            const query = {
                filename: 'FersdsFDs',
                width: '100',
                height: '100',
            };
            const data = (0, images_1.validateQuery)(query);
            expect(data).not.toBeNull();
            expect(data === null || data === void 0 ? void 0 : data.filename).toMatch(/[^A-Z]/);
            expect(data === null || data === void 0 ? void 0 : data.width).toBeGreaterThanOrEqual(0);
            expect(data === null || data === void 0 ? void 0 : data.height).toBeGreaterThanOrEqual(0);
        });
        it('should return null when filename is not present', () => {
            const query = {
                width: '100',
                height: '100',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when width is not present', () => {
            const query = {
                filename: 'FersdsFDs',
                height: '100',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when height is not present', () => {
            const query = {
                filename: 'FersdsFDs',
                width: '100',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when file name is empty string', () => {
            const query = {
                filename: '',
                width: '100',
                height: '100',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when width is negative number', () => {
            const query = {
                filename: 'FersdsFDs',
                width: '-100',
                height: '100',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when width is NaN', () => {
            const query = {
                filename: 'FersdsFDs',
                width: 'teq3r',
                height: '100',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when width is 0', () => {
            const query = {
                filename: 'FersdsFDs',
                width: '0',
                height: '100',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when height is negative number', () => {
            const query = {
                filename: 'FersdsFDs',
                width: '100',
                height: '-100',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when height is NaN', () => {
            const query = {
                filename: 'FersdsFDs',
                width: '100',
                height: 'rwert',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
        it('should return null when height is 0', () => {
            const query = {
                filename: 'FersdsFDs',
                width: '100',
                height: '0',
            };
            expect((0, images_1.validateQuery)(query)).toBeNull();
        });
    });
    describe('ifImageExists(): Check if the file exists.', () => {
        const fullPath = path_1.default.join(__dirname, '..', '..', '..', '..', 'images', 'full');
        it('should return true if the file exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'palmtunnel';
            const filePath = path_1.default.join(fullPath, (0, images_1.getFileName)(filename, images_1.ImageType.jpg));
            const file = yield (0, images_1.ifImageExists)(filePath);
            expect(file).toBeTrue();
        }));
        it('should return false when the file does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'teastazse';
            const filePath = path_1.default.join(fullPath, (0, images_1.getFileName)(filename, images_1.ImageType.jpg));
            const file = yield (0, images_1.ifImageExists)(filePath);
            expect(file).toBeFalse();
        }));
    });
    describe('readImage(): read the image file', () => {
        const fullPath = path_1.default.join(__dirname, '..', '..', '..', '..', 'images', 'full');
        it('should return file buffer if the image exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'fjord';
            const filePath = path_1.default.join(fullPath, (0, images_1.getFileName)(filename, images_1.ImageType.jpg));
            const file = yield (0, images_1.readImage)(filePath);
            expect(file).toBeInstanceOf(Buffer);
        }));
        it('should return null when the image does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'tqawekjag';
            const filePath = path_1.default.join(fullPath, (0, images_1.getFileName)(filename, images_1.ImageType.jpg));
            const file = yield (0, images_1.readImage)(filePath);
            expect(file).toBeNull();
        }));
    });
    describe('getFileName(): get normalized complete file name ', () => {
        it('should return filename.jpg', () => {
            const filename = 'icelandwaterfall';
            expect((0, images_1.getFileName)(filename, images_1.ImageType.jpg)).toBe('icelandwaterfall.jpg');
        });
        it('should return icelandwaterfall_100x100.jpg', () => {
            const filename = 'icelandwaterfall';
            const width = 100;
            const height = 100;
            expect((0, images_1.getFileName)(filename, images_1.ImageType.jpg, width, height)).toBe('icelandwaterfall_100x100.jpg');
        });
        it('should throw error when filename is empty', () => {
            const filename = '';
            expect(function () {
                (0, images_1.getFileName)(filename, images_1.ImageType.jpg);
            }).toThrowError(Error);
        });
        it('should return filename.jpg when width is set but height is not', () => {
            const filename = 'icelandwaterfall';
            const width = 100;
            expect((0, images_1.getFileName)(filename, images_1.ImageType.jpg, width)).toBe('icelandwaterfall.jpg');
        });
    });
    describe('resizeImage(): resize an jpg image ', () => {
        const fullPath = path_1.default.join(__dirname, '..', '..', '..', '..', 'images', 'full');
        const thumbPath = path_1.default.join(__dirname, '..', '..', '..', '..', 'images', 'thumb');
        it('should return file buffer', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'icelandwaterfall';
            const fromFile = path_1.default.join(fullPath, (0, images_1.getFileName)(filename, images_1.ImageType.jpg));
            const width = 100;
            const height = 100;
            const toFile = path_1.default.join(thumbPath, (0, images_1.getFileName)(filename, images_1.ImageType.jpg, width, height));
            const buffer = yield (0, images_1.resizeImage)(fromFile, width, height, toFile);
            expect(buffer).toBeInstanceOf(Buffer);
        }));
        it('should return null when the full size file does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'qwtrasdr';
            const fromFile = path_1.default.join(fullPath, (0, images_1.getFileName)(filename, images_1.ImageType.jpg));
            const width = 100;
            const height = 100;
            const toFile = path_1.default.join(thumbPath, (0, images_1.getFileName)(filename, images_1.ImageType.jpg, width, height));
            const buffer = yield (0, images_1.resizeImage)(fromFile, width, height, toFile);
            expect(buffer).toBeNull();
        }));
    });
    describe('/api/images?filename={filename}&width={width}&height={width}', () => {
        const request = (0, supertest_1.default)(index_1.default);
        it('should return 400 when requesting without any query parameters', () => {
            request.get('/api/images').expect(400);
        });
        it('should return resized image with image/jpeg content type', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'encenadaport';
            const width = 100;
            const height = 100;
            const url = `/api/images?filename=${filename}&width=${width}&height=${height}`;
            yield request.get(url).expect('Content-Type', /image/);
        }));
        it('should return 400 page when filename is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const width = 100;
            const height = 100;
            const url = `/api/images?width=${width}&height=${height}`;
            yield request.get(url).expect(400);
        }));
        it('should return 400 page when width is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'encenadaport';
            const height = 500;
            const url = `/api/images?filename=${filename}&height=${height}`;
            yield request.get(url).expect(400);
        }));
        it('should return 400 page when height is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'encenadaport';
            const width = 500;
            const url = `/api/images?filename=${filename}&width=${width}`;
            yield request.get(url).expect(400);
        }));
        it('should return 400 page when file does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'randomname';
            const width = 500;
            const height = 500;
            const url = `/api/images?filename=${filename}&width=${width}&height=${height}`;
            yield request.get(url).expect(400);
        }));
        it('should return 500 page when image resizing failed (ex. extremely large width, height)', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'santamonica';
            const width = 500000;
            const height = 500000;
            const url = `/api/images?filename=${filename}&width=${width}&height=${height}`;
            yield request.get(url).expect(500);
        }));
    });
});
