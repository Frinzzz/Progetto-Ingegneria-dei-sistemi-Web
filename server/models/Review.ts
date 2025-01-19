import mongoose, { Schema, Document } from 'mongoose';

interface IReview extends Document {
    user: Schema.Types.ObjectId;
    movie: Schema.Types.ObjectId;
    rating: number;
    comment: string;
}

const ReviewSchema: Schema<IReview> = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);