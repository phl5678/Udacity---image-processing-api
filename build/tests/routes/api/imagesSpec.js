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
    describe('/api/images?filename={filename}&width={width}&height={width}', () => {
        const request = (0, supertest_1.default)(index_1.default);
        it('should return resized image with image/jpeg content type', () => __awaiter(void 0, void 0, void 0, function* () {
            const filename = 'encenadaport';
            const width = 100;
            const height = 100;
            const url = `/api/images?filename=${filename}&width=${width}&height=${height}`;
            yield request.get(url).expect('Content-Type', /image/);
        }));
        it('should return 400 when requesting without any query parameters', () => {
            request.get('/api/images').expect(400);
        });
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
