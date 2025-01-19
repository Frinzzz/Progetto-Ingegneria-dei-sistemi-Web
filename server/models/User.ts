import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
    favorites: Schema.Types.ObjectId[];
    isAdmin: boolean;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    isAdmin: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);