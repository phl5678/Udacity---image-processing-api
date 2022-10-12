"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.default = void 0;
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    transports: [new winston_1.default.transports.File({ filename: 'debug.log' })],
});
exports.logger = logger;
const app = (0, express_1.default)();
exports.default = app;
const port = 3000;
app.use('/api', index_1.default);
app.listen(port, () => {
    logger.info(`server started at http://localhost:${port}`);
});
