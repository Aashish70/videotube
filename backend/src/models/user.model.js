import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    fullname: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },

    avatar: {
        type: String,
        required: true,
    },

    coverImage: {
        type: String,
    },

    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],

    password: {
        type: String,
        required: true,
    },

    refreshToken: {
        type: String,
    }

}, { timestamps: true });


//pre is a middleware which run before saving the data in database in mongoose
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
})


userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password); // return true or false
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET, //This is the secret key which is used to encrypted the data
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);