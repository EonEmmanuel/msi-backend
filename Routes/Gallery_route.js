import express from "express"
import { createGallery, deleteGallery, getallGallery, getGallery, updateGallery } from "../Controllers/Gallerycontroller.js"

const router = express.Router()

router.post('/creategallery', createGallery)
router.put('/updategallery/:gallery_id', updateGallery)
router.get('/getallgallery', getallGallery)
router.get('/getgallery/:gallery_id', getGallery)
router.delete('/deletegallery/:gallery_id', deleteGallery)


export default router;
