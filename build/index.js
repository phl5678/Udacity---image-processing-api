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
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const app = (0, express_1.default)();
const port = 3000;
const imgFullPath = path_1.default.join(__dirname, '..', 'images', 'full');
const imgResizePath = path_1.default.join(__dirname, '..', 'images', 'thumb');
var ImageType;
(function (ImageType) {
    ImageType["jpg"] = "jpg";
    ImageType["png"] = "png";
})(ImageType || (ImageType = {}));
function processImage(fromFilePath, width, height, toFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        let buffer = null;
        try {
            buffer = yield (0, sharp_1.default)(fromFilePath)
                .resize(width, height)
                .toFile(toFilePath, (err, info) => {
                console.log(`err: ${err}`);
                console.log(`info: ${info}`);
            })
                .toBuffer();
        }
        catch (err) {
            //TODO: error handling
            console.log(err);
        }
        return buffer;
    });
}
function ifFileExist(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        let file = null;
        try {
            file = yield fs_1.promises.readFile(filePath);
        }
        catch (err) {
            //TODO: error handling
            console.log(err);
        }
        return file;
    });
}
//TODO: currently accept .jpg only. add other formats.
function imageProcessing(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryParams = req.query;
        const filename = 'filename' in queryParams ? queryParams.filename : '';
        const width = 'width' in queryParams
            ? parseInt(queryParams.width)
            : 0;
        const height = 'height' in queryParams
            ? parseInt(queryParams.height)
            : 0;
        if (filename === '' || width === 0 || height === 0) {
            //TODO: error handling
            return;
        }
        const filePath = path_1.default.join(imgResizePath, `${filename}_${width}x${height}.${ImageType.jpg}`);
        const file = yield ifFileExist(filePath);
        if (file !== null) { //send existing image file to the response.
            res.type('jpg');
            res.send(file);
        }
        else { //resize image, save to file, and send it to response.
            const fromFilePath = path_1.default.join(imgFullPath, `${filename}.${ImageType.jpg}`);
            const buffer = yield processImage(fromFilePath, width, height, filePath);
            if (buffer !== null) {
                res.type('jpg');
                res.send(buffer);
            }
        }
        next();
    });
}
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
app.use('/api/images', imageProcessing);
