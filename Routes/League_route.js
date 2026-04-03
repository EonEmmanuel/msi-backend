import express from "express"
import { createLeague, deleteLeague, getAllLeague, getLeague, updateLeague } from "../Controllers/Leaguecontroller.js"

const router = express.Router()

router.post('/createleague', createLeague)
router.get('/getleague/:league_id', getLeague)
router.get('/getallleague', getAllLeague)
router.put('/updateleague/:league_id', updateLeague)
router.delete('/deleteleague/:league_id', deleteLeague)

export default router;
