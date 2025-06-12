import { Schema, model } from "mongoose";

const linkSchema = new Schema({
    originalUrl: {
        type: String,
        required: true,
        trim: true
    },
    redirectKey: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    isCustomKey: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


export const linkModel = model('Link', linkSchema);
