import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if(!content || typeof content !== 'string') throw new ApiError(400, 'Content is required');

    const tweet = new Tweet.create({ content, owner: req.user._id });

    if(!tweet) throw new ApiError(500, "Server Error while creating tweet");

    return res.status(201).json(new ApiResponse(200, tweet, "Tweet created successfully"));
});


const updateTweet = asyncHandler(async (req, res) => {

    const { content } = rew.body;

    const tweet = await Tweet.findById({ _id: req.params.id, owner: req.user._id }, {
        $set: { content: content }
    }, { new: true });

    if(!tweet) {
        throw new ApiError(404, "Something went wrong while updating tweet");
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet has been updated successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {

    const tweets = await Tweet.find({ owner: req.user._id });

    if(tweets.length === 0){
        throw new ApiError(404, "No Tweets Found!");
    }

    return res.status(200).json(new ApiResponse(200, tweets.reverse(), 'Tweets fetched successfully'));
});

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;

    if(!tweetId) throw new ApiError(400, "Invalid request to tweet");

    const tweet = await Tweet.findOnAndDelete({ _id: tweetId, owner: req.user._id })

    if(!tweet) throw new ApiError(404, "Something went wrong while deleting tweet");

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet has been deleted successfully"));
});


export { createTweet, updateTweet, getUserTweets, deleteTweet };