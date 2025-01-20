import mongoose from 'mongoose'
import { Comment } from '../models/comment.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Video } from '../models/video.model.js'


const getVIdeoCommets = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if(!videoId || !mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid request to get comments")

    if(page < 1) throw new ApiError(400, "Invalid page number")
    if(limit < 1) throw new ApiError(400, "Invalid limit number")

    const skip = (page - 1) * limit

    const pipline = [
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId)
            }
        },

        {
            $sort: {
                createdAt: -1
            }
        },

        {
            $skip: skip
        },

        {
            $limit: limit
        },

        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },

        {
            $unwind: '$owner'
        },

        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    avatar: 1
                }
            }
        }
    ]

    const comments = await Comment.aggregate(pipline)

    if(!comments) throw new ApiError(500, "Something went wrong while fetching comments")
    if(comments.length === 0) throw new ApiError(404, "No comments found")

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))
});


const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId) throw new ApiError(400, "Invalid request to add comment")
    
    const { content } = req.body
    if(!content || typeof content !== 'string') throw new ApiError(400, "Content is required to add a comment")

    const video = await Video.findById(videoId)

    if(!video) throw new ApiError(404, "Video not found")

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    if(!comment) throw new ApiError(500, "Something went wrong while adding the comment")

    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"))
})


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if(!commentId) throw new APiError(400, "Invalid request to update comment")

    const { content } = req.body

    if(!content || typeof content !== 'string') throw new ApieError(400, "Content is required to add comment")

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        content
    }, { new: true }).populate('owner', 'username avatar').populate('video', 'title')

    if(!updatedComment) throw new ApiError(500, "Something went wrong while updating the comment")

    return res.status(200).json(new Apiresponse(201, updatedComment, "Comment updated successfully"))
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if(!commentId) throw new ApiError(400, "Invalid request to delete comment")

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment) throw new ApiError(500, "Something went wrong while deleting the comment")

    return res.status(200).json(new ApiResponse(200, deletedComment, "Comment deleted successfully"))
})


export { getVIdeoCommets, addComment, updateComment, deleteComment }
