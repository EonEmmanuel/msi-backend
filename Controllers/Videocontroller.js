import db from '../db.js'
 
 export const createVideo = async (req, res, next) => {

        try {
            const { title, video_url, date, desc, tag, program } = req.body;

          const programcheck = await db.query('SELECT * FROM "Emission" WHERE video_url = $1', [video_url]);
          
          if (programcheck.rows.length > 0) {
            return res.status(404).json({ message:'Video Already Exist'});
          }

        const video_slug = `${title}`
        .toLowerCase()
        .replace(/\s+/g, "-");
            
            const result = await db.query(
              'INSERT INTO "Emission" ( video_slug, title, video_url, date, "desc", tag, program ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
              [ video_slug, title, video_url, date, desc, tag, program ]
            );
              res.status(201).json(result.rows);
          } catch (error) {
              res.status(500).json({ error: error.message });
          }
        };

        export const getVideo = async (req, res) => {

          const { video_slug } = req.params;
        
          try {
            // 1. Query the database to get the video
            const result = await db.query(`
              SELECT e.video_slug, e.emission_id, e.title, e.video_url, e.date, e."desc", e.tag, e.program, p.name, p.image, p.duration, p.themecolor
              FROM "Emission" e
              JOIN "Program" p ON e.program = p.program_id
              WHERE video_slug = $1
            `, [video_slug]);
        
            // 2. If no video is found, return a 404 response
            if (result.rows.length === 0) {
              return res.status(404).json({ message: 'Video not found' });
            }
        
            // 3. Respond with the video data
            res.json(result.rows[0]);
          } catch (error) {
            // Error handling
            console.error('Error retrieving video:', error.message);
            res.status(500).json({ error: error.message });
          }
        }

        export const getVideoId = async (req, res) => {

          const { emission_id } = req.params;
        
          try {
            // 1. Query the database to get the video
            const result = await db.query(`
             SELECT e.video_slug, e.emission_id, e.title, e.video_url, e.date, e."desc", e.tag, e.program, p.name, p.image, p.duration, p.themecolor
              FROM "Emission" e
              JOIN "Program" p ON e.program = p.program_id
              WHERE emission_id = $1
            `, [emission_id]);
        
            // 2. If no video is found, return a 404 response
            if (result.rows.length === 0) {
              return res.status(404).json({ message: 'Video not found' });
            }
        
            // 3. Respond with the video data
            res.json(result.rows[0]);
          } catch (error) {
            // Error handling
            console.error('Error retrieving video:', error.message);
            res.status(500).json({ error: error.message });
          }
        }
        
        
        export const getallVideo = async (req, res) => {
          try {

            const limit = parseInt(req.query.limit) || 100;

            // 1. Query the database to get all highlights
            const result = await db.query(`
              SELECT e.video_slug, e.emission_id, e.title, e.video_url, e.date, e."desc", e.tag, e.program, p.name, p.image, p.duration, p.themecolor
              FROM "Emission" e
              JOIN "Program" p ON e.program = p.program_id
              ORDER BY emission_id DESC LIMIT $1
           `, [limit]);

           const sum = await db.query('SELECT COUNT(*) FROM "Emission"');
           const total = sum.rows[0].count;
        
            // 2. Check if any highlights are found
            if (result.rows.length === 0) {
              return res.status(404).json({ message: 'No Video found' });
            }

            const data = result.rows

            // 3. Respond with all highlights
            res.json({data, total});
          } catch (error) {
            // Error handling
            console.error('Error retrieving videos:', error.message);
            res.status(500).json({ error: error.message });
          }
        }

        export const updateVideo = async (req, res) => {
          try {
            const { emission_id } = req.params;
            const { title, video_url, date, desc, tag, program } = req.body;
            
            // First check if highlight exists
            const highlight = await db.query('SELECT * FROM "Emission" WHERE emission_id = $1', [emission_id]);
            if (highlight.rows.length === 0) {
              return res.status(404).json({ message: 'Emission not found' });
            }
        
            const result = await db.query(
              'UPDATE "Emission" SET title = $2, video_url = $3, date = $4, "desc" = $5, tag = $6, program = $7 WHERE emission_id = $1 RETURNING *',
              [emission_id, title, video_url, date, desc, tag, program]
            );
            
            res.json(result.rows);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }

        export const deleteVideo = async (req, res) => {

          const { emission_id } = req.params;
        
          try {
            // Check if the highlight exists
            const highlightResult = await db.query('SELECT * FROM "Emission" WHERE emission_id = $1', [emission_id]);
            if (highlightResult.rows.length === 0) {
              return res.status(404).json({ message: 'Highlight not found' });
            }
            
            // Delete the highlight from the database
            const deleteResult = await db.query('DELETE FROM "Emission" WHERE emission_id = $1 RETURNING *', [emission_id]);
        
            // Check if the deletion was successful (returning deleted highlight)
            if (deleteResult.rows.length === 0) {
              return res.status(500).json({ message: 'Failed to delete video' });
            }
        
            // Respond with a success message
            res.json({ message: 'Emission deleted successfully', emission_id: emission_id });
          } catch (error) {
            // Error handling
            console.error('Error deleting video:', error.message);
            res.status(500).json({ error: error.message });
          }
        }

