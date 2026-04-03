import express from "express"
import { createTeam, updateTeam, getTeam, deleteTeam, getAllTeam } from "../Controllers/Teamcontroller.js"

const router = express.Router()

router.post('/createteam', createTeam)
router.put('/updateteam/:team_id', updateTeam)
router.get('/getteam/:team_id', getTeam)
router.get('/getallteam', getAllTeam)
router.delete('/deleteteam/:team_id', deleteTeam)

export default router;
