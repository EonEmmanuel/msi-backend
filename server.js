import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import teamRoute from './Routes/Team_route.js'
import userRoute from './Routes/User_route.js'
import ProgramRoute from './Routes/Program_route.js'
import ScheduleRoute from './Routes/Schedule_route.js'
import ArticleRoute from './Routes/Article_route.js'
import standingRoute from './Routes/Standing_route.js'
import LeagueRoute from './Routes/League_route.js'
import VideoRoute from './Routes/Video_route.js'
import matchdayRoute from './Routes/Matchday_route.js'
import GalleryRoute from './Routes/Gallery_route.js'
import LiveRoute from './Routes/Live_route.js'

 dotenv.config()

const app = express()

   app.use(express.json())
   app.use(cookieParser())
   app.use(cors())

   app.get('/', (req, res) => {
      res.send('server running....!!!');
    });

app.listen(3002, () => {
    console.log("Server is on run......!!!")
})

app.use('/api/msi', teamRoute, userRoute, standingRoute, GalleryRoute, LiveRoute, matchdayRoute, ProgramRoute, ArticleRoute, VideoRoute, ScheduleRoute, LeagueRoute)
