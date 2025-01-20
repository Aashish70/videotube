import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();
router.route("/publish-video").post(verifyJWT, upload.fields(
    [
        {
            name: "videoFile",
            maxCount: 1,
        },

        {
            name: "thumbnail",
            maxCount: 1,
        }
    ]
), publishAVideo);

router.route("/delete-video/:id").delete(verifyJWT, upload.fields(
    [
        {
            name: "thumbnail",
            maxCount: 1,
        }
    ]
), deleteVideo);

router.route("/get-all-videos").get(getAllVideos);
router.route("/get-video/:id").get(getVideoById);
router.route("/update-video/:id").patch(verifyJWT, updateVideo);
router.route("/toggle-publish-status/:id").patch(verifyJWT, togglePublishStatus);

export default router;