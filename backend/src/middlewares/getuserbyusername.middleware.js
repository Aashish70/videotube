import { User } from '../models/user.model.js'; 
import { ApiError } from '../utils/ApiError.js';


export const getuserByusername = async (username) => {
    const userByUsername = await User.findOne({ username: username });

    if(!userByUsername){
        throw new ApiError(400, "No user found with this username");
    }   

    return userByUsername;
}