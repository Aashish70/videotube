import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        default: "This playlist has no description.",
    },

    video: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
    
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);