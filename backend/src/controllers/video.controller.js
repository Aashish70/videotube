import mongoose , { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const publishAVideo = asyncHandler( async (req, res) => {
    
    const { title, description } = req.body;

    if(!title || !description) throw new ApiError(400, "Title and description is needed")

    const videoFileLocalpath = req.files?.videoFile[0].path;
    const thumbnailLocalpath = req.files?.thumbnail[0].path;

    if(!videoFileLocalpath || !thumbnailLocalpath) throw new ApiError(422,  "No file uploaded");

    const videofileURL = await uploadOnCloudinary(videoFileLocalpath);
    // console.log("Video File URL: ", videofileURL);

    const thumbnailURL = await uploadOnCloudinary(thumbnailLocalpath);

    if(!thumbnailURL){
        throw new ApiError(503, "thumbnail could not be uploaded at the moment");
    }

    if(!videofileURL){
        throw new ApiError(503, "video could not be uploaded at the moment");
    }

    const publishedVideo = Video.create({
        title,
        description,
        videoFile: videofileURL?.url,
        thumbnail: thumbnailURL?.url,
        owner: req.user._id,
        duration: videofileURL?.duration,
    })

    if(!publishedVideo) throw new ApiError(500, "Failed to save video in database");


    return res.status(201).json(new ApiResponse(201, { publishedVideo }, "Video hase been published successfully"));    

})


const getVideoById = asyncHandler( async (req, res) => {
    const { videoId  } = req.params;

    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId).populate("owner", "username email")

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    video.views += 1; // Increment the views by 1
    await video.save();
    return res.status(200).json(new ApiResponse(200, { video }, "Video found successfully"))
})




const updateVideo = asyncHandler( async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if(!title && !description) throw new ApiError(400, "All fields are required");

    if(!videoId) throw new ApiError(400, "Video id is required");

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const thumbnailLocalpath = req.files?.thumbnail[0].path;
    if(!thumbnailLocalpath) throw new ApiError(400, "Thumnail is required");

    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath);
    if(!thumbnail) throw new ApiError(503, "Failed to upload thumbnail");

    const updatedVideo = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user._id
        },

        {
            title,
            description,
            thumbnail: thumbnail?.url
        },

        {
            new: true
        }
    ).populate("owner", "username email");


    if(!updatedVideo) throw new ApiError(404, "Video is not found or not updated")

    return res.status(200).json(new ApiResponse(200, { data: updatedVideo }, "Video updated successfully"));
})


const deleteVideo = asyncHandler (async (req, res) => {
    const { videoId } = req.params;

    if(!videoId) throw new ApiError(400, "Video id is required");

    if(!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

    const video = await Video.findOneAndDelete(
        {
            _id: videoId,
            owner: req.user._id
        }
    )

    return res.status(200).json(new ApiResponse(200, { data: video }, "Video deleted successfully"));
})



const togglePublishStatus = asyncHandler( async (req, res) => {
    const { videoId } = req.params;

    if(!videoId) throw new ApiError(400, "Video id is required");

    if(!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");
    
    const video = await Video.findOne(
        {
            _id: videoId,
            owner: req.user._id
        }
    ).select("published");

    if(!video) throw new ApiError(404, "Video not found");

    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        isbublished: !video.published
    }, 
    {
        new: true
    }).populate("owner", "username email");

    if(!updatedVideo) throw new ApiError(404, "Failed to update video status");

    return res.status(201).json(new ApiRepsonse(201, { data: updatedVideo }, "Video status updated successfully"));
})



const getAllVideos = asyncHandler( async (req, res) => {
    const { page = 1, limit = 10, query, sortType, sortBy, username } = req. query;

    if(page < 1) throw new ApiError(400, "Invalid page number");
    if(limit < 10) throw new ApiError(400, "Invalid limit")

    if(sortBy && !["title", "createdAt", "views"].includes(sortBy)) throw new ApiError(400, " Invalid sortBy value");
    if(!sortType || ["asc", "desc"].indexOf(sortType) === -1) throw new ApiError(400, "Query or Username is required");

    /**
     * const user = await getuserByUsername(username);
     * const testRegex = new RegExp(username, 'i');
     * console.log(testRegex.test)
     */


    let pipelineToFindUsingTitleAndDescription = [
        {
            $match: {
                $or: [
                    { title: {regex: new RegExp(query, 'i')}},
                    { description: {regex: new RegExp(query, 'i')}}
                ]
            }
        },

        {
            $sort: {
                [sortBy]: sortType === "asc" ? -1 : 1
            }
        },

        {
            skip: (page - 1) * parseInt(limit)
        },

        {
            $limit: parseInt(limit)
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "users",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                            coverImage: 1,
                        }
                    }
                ]
            }
        }
    ]

    let pipelineToFindUsingUsername = [
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "users",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                            coverImage: 1,
                        }
                    }
                ]
            }
        },

        {
            $match: {
                $or: [
                    {
                        "users.username": {$regex: new RegExp(username, 'i')}
                    }
                ]
            }
        },

        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1
            }
        },

        {
            $sip: (page - 1) * parseInt(limit)
        },

        {
            $limit: parseInt(limit)
        }
    ]

    var pipeline;
    if(username){
        pipeline = pipelineToFindUsingUsername;
    }
    else{
        pipeline = pipelineToFindUsingTitleAndDescription;
    }


    const videos = await Video.aggregate(pipeline);

    if(!videos) {
        throw new ApiError(500, "No videos found");
    }

    const totalVideos = videos.length;
    const totalPages = Math.ceil(totalVideos / limit);


    return res.status(200).json(new ApiResponse(200, { videos, totalVideos, totalPages }, "Videos fetched Succesfully"));
})





export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }