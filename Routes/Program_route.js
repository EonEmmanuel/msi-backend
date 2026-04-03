import express from "express"
import { createProgram, deleteProgram, getAllProgram, getProgram, updateProgram } from "../Controllers/Programcontroller.js"

const router = express.Router()

router.post('/createprogram', createProgram)
router.get('/getprogram/:program_id', getProgram)
router.get('/getallprogram', getAllProgram)
router.put('/updateprogram/:program_id', updateProgram)
router.delete('/deleteprogram/:program_id', deleteProgram)



export default router;
