"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));

const ReviewSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Movie", required: true }, 
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true }); 

exports.default = mongoose_1.default.model('Review', ReviewSchema);