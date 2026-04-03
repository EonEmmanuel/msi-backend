import express from "express"
import { createArticle, deleteArticle, getallArticle, getArticle, getArticleId, updateArticle } from "../Controllers/Articlecontroller.js"

const router = express.Router()

router.post('/createarticle', createArticle)
router.put('/updatearticle/:article_id', updateArticle)
router.get('/getallarticle', getallArticle)
router.get('/getarticle/:slug', getArticle)
router.get('/getarticleid/:article_id', getArticleId)
router.delete('/deletearticle/:article_id', deleteArticle)


export default router;
