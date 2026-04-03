import express from "express"
import { createSchedule, deleteSchedule, getAllSchedule, getSchedule, getScheduleByDay, updateSchedule } from "../Controllers/Schedulecontroller.js"

const router = express.Router()

router.post('/createschedule', createSchedule)
router.put('/updateschedule/:schedule_id', updateSchedule)
router.get('/getschedule/:schedule_id', getSchedule)
router.get('/getschedulebyday', getScheduleByDay)
router.get('/getallschedule', getAllSchedule)
router.delete('/deleteschedule/:schedule_id', deleteSchedule)

export default router;
