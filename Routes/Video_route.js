import express from "express"
import { createVideo, deleteVideo, getallVideo, getVideo, getVideoId, updateVideo } from "../Controllers/Videocontroller.js"

const router = express.Router()

router.post('/createvideo', createVideo)
router.put('/updatevideo/:emission_id', updateVideo)
router.get('/getvideo/:video_slug', getVideo)
router.get('/getvideoid/:emission_id', getVideoId)
router.get('/getallvideo', getallVideo)
router.delete('/deletevideo/:emission_id', deleteVideo)

export default router;
