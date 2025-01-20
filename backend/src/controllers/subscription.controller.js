import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { getuserbyusername } from "../middlewares/getuserbyusername.middleware.js";



const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelname } = req.params

    const channel = await getuserbyusername(channelname)

    if(channel === null){
        throw new ApiError(400, "No channel found with this username")
    }

    const user = req.user

    const subscribed = await Subscription.findOne({ channel: user._id, subscriber: channel._id})

    if(subscribed){
        await Subscription.deleteOne({channel: user._id, subscriber: channel._id})
        return res.status(200).json(new ApiResponse(200, {}, `Unsubscribed from ${channel.username}`))
    }

    if(!subscribed){
        await Subscription.create({channel: user._id, subscriber: channel._id})
        return res.status(200).json(new ApiResponse(200, {}, `Subscribed to ${channel.username}`))
    }

    return res.status(200).json(new ApiResponse(200, {}, "Trail in toggle subscription"))
});


//controller to return subscriber list of a channel

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const channel = await getuserbyusername(req.params.channelname)
    if(channel === null){
        throw new ApiError(400, "No channel found with this username")
    }

    const subscribers = await Subscription.find({channel: channel._id})

    return res.status(200).json(new ApiResponse(200, subscribers?.length, "Subscribers fetched successfully"))
});


//controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // const { subscribed } = req.params

    const subscribedTo = await Subscription.find({subscriber: req.user._id}).populate("channel", ["_id", "profilepic", "username"])

    if(!subscribedTo){
        throw new ApiError(500, "Server errror while fetching subscribedTo channels")
    }

    return res.status(200).json(new ApiResponse(200, subscribedTo.length, "Subscribed channels fetched successfully"))
})


export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }