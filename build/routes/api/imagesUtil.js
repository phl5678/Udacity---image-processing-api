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
exports.imgThumbPath = exports.imgFullPath = exports.ImageType = exports.resizeImage = exports.readImage = exports.ifImageExists = exports.getImagePath = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const index_1 = require("../../index");
const imgFullPath = path_1.default.join(__dirname, '../../../', 'images', 'full');
exports.imgFullPath = imgFullPath;
const imgThumbPath = path_1.default.join(__dirname, '../../../', 'images', 'thumb');
exports.imgThumbPath = imgThumbPath;
var ImageType;
(function (ImageType) {
    ImageType["jpg"] = "jpg";
    ImageType["png"] = "png";
})(ImageType || (ImageType = {}));
exports.ImageType = ImageType;
/**
 * Get the complete file name with type extension. If both width and height have value, add the width/height info into the filename.
 * @param filename image filename without type extension
 * @param type type extension
 * @param filepath the file path to images/full or images/thumb
 * @param width (optional) width of the image.
 * @param height (optional) height of the image
 * @returns normalized file name
 */
function getImagePath(filename, type, filepath, width, height) {
    if (filename.length === 0) {
        index_1.logger.error('getFileName(): Filename must not be empty string.');
        throw new Error('Filename must not be empty string.');
    }
    return width !== undefined && height !== undefined
        ? path_1.default.join(filepath, `${filename.toLowerCase()}_${width}x${height}.${type}`)
        : path_1.default.join(filepath, `${filename.toLowerCase()}.${type}`); //ignore width and height in the file name if only width or only height is passed.
}
exports.getImagePath = getImagePath;
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
