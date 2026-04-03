import express from "express"

import { 
    createFixture, createResult, 
    deleteFixture, deleteResult, 
    getAllFixture, getAllMatchResults, getAllResult, 
    getFixture, getMatchResults,
    updateFixture, updateResult } from "../Controllers/Matchdaycontrolller.js"

const router = express.Router()

router.post('/createfixture', createFixture)
router.get('/getfixture/:fixture_id', getFixture)
router.get('/getallfixture', getAllFixture)
router.put('/updatefixture/:fixture_id', updateFixture)
router.delete('/deletefixture/:fixture_id', deleteFixture)

router.post('/createresult', createResult)
router.get('/getresult/:result_id', getMatchResults)
router.get('/getallmatchresult', getAllResult)
router.get('/getallmatchresult/:matchday', getAllMatchResults)


router.put('/updateresult/:result_id', updateResult)
router.delete('/deleteresult/:result_id', deleteResult)

export default router;
