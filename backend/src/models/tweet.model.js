import mongoose from 'mongoose';

const tweetSchema = new mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    content: {
        type: String,
        required: true,
        maxLength: [140, "Tweet can't be longer than 140 characters"],
    }
    
}, { timestamps: true });

export const Tweet = mongoose.model('Tweet', tweetSchema);