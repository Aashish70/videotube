import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { Playlist } from '../models/playlist.model.js'
import { Video } from '../models/video.model.js'



const createPlaylist = asyncHandler(async (req, res) => {
    
    const {name, description} = req.body
    const owner = req.user?._id
    
    if(!owner){
        throw new ApiError(400, "Unauthorized request")
    }

    if(!name || typeof name !== 'string') throw new ApiError(400, "Name should be required")

    const playlist = await Playlist.create({
        name,
        description,
        owner
    })

    return res.status(200).json(new ApiResponse(200, playlist, `New playlist created by ${req.user.fullname}`))
})


const getUserPlaylists = asyncHandler(async(req, res) => {

    const { username } = req.params
    const userId = await getuserByusername(username)

    if(!userId){
        throw new ApiError(400, "No user found with this username")
    }

    const playlists = await Playlist.find({ owner: userId }).sort('-createdAt')

    return res.status(200).json(new ApiResponse(200, playlists, "All playlists of the user are fetched successfully"))
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if(!playlistId){
        throw new ApiError(400, "Invalid request for playlist")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(500, "Something went wrong while fetching the playlist")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist is fetched Successfully"))
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    if(!playlistId){
        throw new ApiError(400, "Invalid request to Add to playlist")
    }

    if(!videoId){
        throw new ApiError(400, "Video is required to be added in the playlist")
    }

    let video = await Video.findOne({ _id: videoId, owner: req.user._id })

    console.log("Video", video)

    if(!video){
        throw new ApiError(400, "You are not the owner of the video or video does not exists")
    }

    let playlist = await Playlist.findOne({ _id: playlistId, owner: req.user._id})

    if(!playlist){
        throw new ApiError(500, "Something went wrong while fetching the playlist")
    }

    //check whether this video is already exists in the playlist

    if(playlist.video.includes(videoId)){
        throw new ApiError(400, "Video is already exist in the playlist")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId
        },

        //Use $addToSet to add unique videoIds to the videos array

        {
            $addToSet: {
                videos: {
                    $each: [videoId]
                }
            }
        },

        {
            new: true
        }
    );


    if(updatedPlaylist){
        throw new ApiError(500, "something went wrong with adding a video to the playlist")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Successfully added a video to playlist"))
})


const removeVideoFromPlaylist = asyncHandler(async (req, res) =>  {

    const { playlistId, videoId } = req.params

    if(!playlistId){
        throw new ApiError(400, "Invalid request to delete from playlist")
    }

    if(!videoId){
        throw new ApiError(400, "video is required to be removed from the playlist")
    }

    let updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id,
        },

        {
            $pull: {
                videos: videoId
            }
        },

        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(500, "Something went wrong while removing the video from the playlist")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Successfully removed the video from the playlist"))
})

const updatePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params
    const { name, description } = req.body
    
    if(!playlistId){
        throw new ApiError(400, "Invalid request to update playlist")
    }

    if(!name && !description){
        throw new ApiError(400, "Name or Description is required to update the playlist")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },

        {
            $set: {
                name,
                description
            }
        },

        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(500, "Something went wrong while updating the playlist")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Successfully updated the playlist"))
})


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if(!playlistId){
        throw new ApiError(400, "Invalid request to delete playlist")
    }

    const playlist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
            owner: req.user._id
        }
    )

    if(!playlist){
        throw new ApiError(500, "Something went wrong while deleting the playlist")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Successfully deleted the playlist"))
})



export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

