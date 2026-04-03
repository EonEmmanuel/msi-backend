import express from "express"
import { createLive, deleteLive, getallLive, getLive, updateLive } from "../Controllers/Livecontroller..js"

const router = express.Router()

router.post('/createlive', createLive)
router.put('/updatelive/:live_id', updateLive)
router.get('/getalllive', getallLive)
router.get('/getlive/:live_id', getLive)
router.delete('/deletelive/:live_id', deleteLive)


export default router;
