import express from "express"
import { createuser, deleteuser, forgotpassword, getuser, getuserid, login, profile, updateuser } from "../Controllers/Usercontroller.js"
import authenticateToken from "../middleware.js"

const router = express.Router()

router.post('/register', createuser)
router.post('/login', login)
router.get('/profile', authenticateToken, profile)
router.get('/getusers', getuser)
router.get('/getuser/:user_id', getuserid)
router.put('/forgotpassword', forgotpassword)
router.put('/updateuser/:user_id', updateuser)
router.delete('/deleteuser/:user_id', deleteuser)

export default router;
