import mongoose, { Document, Schema } from 'mongoose';

interface IMovie extends Document {
    title: string;
    description: string;
    poster: string;
    rating?: number;
    category: string;
    fileName: string; // Nome del file video
}

const MovieSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    poster: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5 },
    category: { type: String, required: true },
    fileName: { type: String, required: true }, // Nome del file video
});

export default mongoose.model<IMovie>('Movie', MovieSchema);