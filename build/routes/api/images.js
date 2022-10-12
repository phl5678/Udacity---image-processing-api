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
exports.ImageType = exports.imageProcessing = exports.resizeImage = exports.readImage = exports.getFileName = exports.ifImageExists = exports.validateQuery = exports.default = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const index_1 = require("../../index");
const images = express_1.default.Router();
exports.default = images;
const imgFullPath = path_1.default.join(__dirname, '../../../', 'images', 'full');
const imgResizePath = path_1.default.join(__dirname, '../../../', 'images', 'thumb');
var ImageType;
(function (ImageType) {
    ImageType["jpg"] = "jpg";
    ImageType["png"] = "png";
})(ImageType || (ImageType = {}));
exports.ImageType = ImageType;
/**
 * Validate the query parameters, it should contain filename, width, and height.
 * @param queryParams request.query objecy casted as RequestQuery interface.
 * @returns filename, width, and height object literal as shape of RequestQuery or null if any of params is empty/0
 */
function validateQuery(queryParams) {
    let filename = 'filename' in queryParams ? queryParams.filename : '';
    let width = 'width' in queryParams
        ? parseInt(queryParams.width)
        : 0;
    let height = 'height' in queryParams
        ? parseInt(queryParams.height)
        : 0;
    filename = filename.toLowerCase();
    width = Number.isNaN(width) || width <= 0 ? 0 : width;
    height = Number.isNaN(height) || height <= 0 ? 0 : height;
    if (filename.length === 0 || width === 0 || height === 0)
        return null;
    return { filename, width, height };
}
exports.validateQuery = validateQuery;
/**
 * Get the complete file name with type extension. If both width and height have value, add the width/height info into the filename.
 * @param filename filename without type extension
 * @param type type extension
 * @param width (optional) width of the image.
 * @param height (optional) height of the image
 * @returns normalized file name
 */
function getFileName(filename, type, width, height) {
    if (filename.length === 0) {
        index_1.logger.error('getFileName(): Filename must not be empty string.');
        throw new Error('Filename must not be empty string.');
    }
    if (width !== undefined && height !== undefined) {
        return `${filename.toLowerCase()}_${width}x${height}.${ImageType.jpg}`;
    }
    else {
        //ignore width and height in the file name if only width or only height is passed.
        return `${filename.toLowerCase()}.${ImageType.jpg}`;
    }
}
exports.getFileName = getFileName;
/**
 * A promise that checks if a file exists and can be read.
 * @param filePath the full path of the image file.
 * @returns True if the file exists, false otherwise.
 */
function ifImageExists(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.access(filePath, fs_1.promises.constants.R_OK);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
exports.ifImageExists = ifImageExists;
/**
 * A Promise that read the entire image file
 * @param filePath the full path of the image file.
 * @returns the file content buffer or null if file not found.
 */
function readImage(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (filePath.length === 0)
            return null;
        try {
            return yield fs_1.promises.readFile(filePath);
        }
        catch (err) {
            if (err instanceof Error) {
                if (!err.message.startsWith('ENOENT')) {
                    index_1.logger.error(`fsPromises.readFile error: ${err.message}`);
                    throw new Error(`fsPromises.readFile error: ${err.message}`);
                }
                //Do not throw errors for file not exist. Just silently log the error.
                index_1.logger.info(`Resize image not found: ${err.name}- ${err.message}`);
            }
            return null;
        }
    });
}
exports.readImage = readImage;
/**
 * A promise that resizes the image to specific width and height using Sharp. This saves the resized image into a new file and returns the resized image buffer.
 * @param fromFilePath the full path of the original full size image
 * @param width the resized width. must greater than 0.
 * @param height the resized height. must greater than 0.
 * @param toFilePath the full path including file name that you want to save the resized image to.
 * @returns Promise<buffer> the file content in buffer if it's successfully resized or null if error.
 */
function resizeImage(fromFilePath, width, height, toFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fromFilePath.length === 0 || toFilePath.length === 0)
            return null;
        try {
            return yield (0, sharp_1.default)(fromFilePath)
                .resize(width, height)
                .toFile(toFilePath, (err) => {
                if (err !== null) {
                    index_1.logger.error(`sharp.toFile error: ${err.name}- ${err.message}`);
                }
            })
                .toBuffer();
        }
        catch (err) {
            if (err instanceof Error) {
                index_1.logger.error(`processImage error: ${err.name}- ${err.message}`);
            }
            return null;
        }
    });
}
exports.resizeImage = resizeImage;
/**
 * The middleware for processing image. The example url request, /api/images?filename=example&width=100&height=100
 * @param req http request
 * @param res http response
 * @param next the next
 */
function imageProcessing(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            index_1.logger.info('Start image processing middleware');
            //Validate the query
            const queryParams = validateQuery(req.query);
            if (queryParams === null) {
                res.status(400).end();
                index_1.logger.error(`validateQuery error: invalid query parameters.`);
                return;
            }
            const origFilePath = path_1.default.join(imgFullPath, getFileName(queryParams.filename, ImageType.jpg));
            const resizeFilePath = path_1.default.join(imgResizePath, getFileName(queryParams.filename, ImageType.jpg, queryParams.width, queryParams.height));
            index_1.logger.info(`Input file path: ${origFilePath}`);
            index_1.logger.info(`Output file path: ${resizeFilePath}`);
            //Check if the original full size image exists
            const ifExists = yield ifImageExists(origFilePath);
            if (!ifExists) {
                res.status(400).end();
                index_1.logger.error(`ifFileExist error: full size image does not exist. ${origFilePath}`);
                return;
            }
            //Get the resize image if it exists. Otherwise resize and save to file.
            const resizeFile = yield readImage(resizeFilePath);
            if (resizeFile !== null && resizeFile.byteLength !== 0) {
                //send existing image file to the response.
                index_1.logger.info('Resize file exists. Send directly to the response.');
                res.type('jpg');
                res.send(resizeFile).end();
            }
            else {
                //resize image, save to file, and send it to response.
                index_1.logger.info('Resize file not found. Resize, save to file, and send to the response.');
                const buffer = yield resizeImage(origFilePath, queryParams.width, queryParams.height, resizeFilePath);
                if (buffer !== null) {
                    res.type('jpg');
                    res.send(buffer).end();
                }
                else {
                    res.status(500).end();
                    index_1.logger.error(`resizeImage error: resize buffer is null. ${resizeFilePath}.`);
                }
            }
        }
        catch (err) {
            res.status(400).end();
            if (err instanceof Error) {
                index_1.logger.error(`imageProcessing: ${err.name}- ${err.message}`);
            }
        }
        index_1.logger.info('Done image processing.');
        next();
    });
}
exports.imageProcessing = imageProcessing;
images.use('/', imageProcessing);
