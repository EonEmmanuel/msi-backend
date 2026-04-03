import express from "express"
import { getStanding, updateStanding, deleteStanding, getAllStanding, createStanding } from "../Controllers/Standingcontroller.js";

const router = express.Router()

router.post('/createstanding', createStanding)
router.get('/getallstanding', getAllStanding)
router.get('/getstanding/:stand_id', getStanding)
router.put('/updatestanding/:stand_id', updateStanding)
router.delete('/deletestanding/:stand_id', deleteStanding)

export default router;
