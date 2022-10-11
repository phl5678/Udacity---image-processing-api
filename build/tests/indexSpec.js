"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
describe('indexSpec.js', () => {
    const request = (0, supertest_1.default)(index_1.default);
    describe('/api', () => {
        it('should return 200 when requesting /api', () => {
            request.get('/api').expect(200);
        });
    });
});
