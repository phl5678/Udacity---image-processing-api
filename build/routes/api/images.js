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
exports.imageProcessing = exports.validateQuery = exports.default = void 0;
const express_1 = __importDefault(require("express"));
const index_1 = require("../../index");
const imagesUtil_1 = require("./imagesUtil");
const images = express_1.default.Router();
exports.default = images;
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
 * The middleware for processing image. The example url request, /api/images?filename=example&width=100&height=100
 * @param req http request
 * @param res http response
 * @param next the next function
 */
function imageProcessing(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            index_1.logger.info('---Start image processing middleware---');
            //Validate the query
            const queryParams = validateQuery(req.query);
            if (queryParams === null) {
                index_1.logger.error(`validateQuery error: invalid query parameters.`);
                throw new Error('Invalid query parameters. Please provide valid filename (name without file extension), width (positive number), and height (positive number).');
            }
            const origFilePath = (0, imagesUtil_1.getImagePath)(queryParams.filename, imagesUtil_1.ImageType.jpg, imagesUtil_1.imgFullPath);
            const resizeFilePath = (0, imagesUtil_1.getImagePath)(queryParams.filename, imagesUtil_1.ImageType.jpg, imagesUtil_1.imgThumbPath, queryParams.width, queryParams.height);
            index_1.logger.info(`Reading resize image: ${resizeFilePath}`);
            //Get the resize image if it exists. Otherwise resize and save to file.
            const resizeFile = yield (0, imagesUtil_1.readImage)(resizeFilePath);
            if (resizeFile !== null && resizeFile.byteLength !== 0) {
                //send existing image file to the response.
                index_1.logger.info('Resize file exists. Send directly to the response.');
                res.type('jpg');
                res.send(resizeFile);
            }
            else {
                //resize image, save to file, and send it to response.
                index_1.logger.info('Resize file not found. Resizing and saving to file.');
                const buffer = yield (0, imagesUtil_1.resizeImage)(origFilePath, queryParams.width, queryParams.height, resizeFilePath);
                if (buffer !== null && buffer.byteLength !== 0) {
                    res.type('jpg');
                    res.send(buffer);
                    index_1.logger.info('Resized file saved and sent to response.');
                }
                else {
                    index_1.logger.error(`resizeImage error: resize buffer returned null.`);
                    throw new Error('Image cannot be resized. Please try again.');
                }
            }
        }
        catch (err) {
            if (err instanceof Error) {
                index_1.logger.error(`${err.name} - ${err.message}`);
                if (
                //User error
                err.message.startsWith('Input file is missing') ||
                    err.message.startsWith('Invalid query parameters')) {
                    res.status(400).send(err.message);
                }
                else {
                    //System error
                    res.status(500).send(err.message);
                }
            }
        }
        index_1.logger.info('---Done image processing middleware---');
        next();
    });
}
exports.imageProcessing = imageProcessing;
images.use('/', imageProcessing);
