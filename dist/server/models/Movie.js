"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));

const MovieSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    poster: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5 },
    category: { type: String, required: true },
    fileName: { type: String, required: true }, 
});

exports.default = mongoose_1.default.model('Movie', MovieSchema);
