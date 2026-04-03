import db from '../db.js'

export const createLive = async (req, res, next) => {

    try {
        const { link, name, tag } = req.body;
        
        const linkcheck = await db.query('SELECT * FROM "Live" WHERE link = $1', [link]);
          
          if (linkcheck.rows.length > 0) {
            return res.status(404).json({ message:'Link Already Exist'});
          }
        
        const result = await db.query(
          'INSERT INTO "Live" (link, name, tag) VALUES ($1, $2, $3) RETURNING *',
          [link, name, tag]
        );

        res.status(201).json(result.rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
    

    export const getLive = async (req, res) => {

      const { live_id } = req.params;
    
      try {
        // 1. Query the database to get the blog
        const result = await db.query(`
          SELECT link, name, tag
          FROM "Live"
          WHERE live_id = $1
        `, [live_id]);
    
        // 2. If no player is found, return a 404 response
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Live not found' });
        }
    
        // 3. Respond with the live data
        res.json(result.rows[0]);
      } catch (error) {
        // Error handling
        console.error('Error retrieving live:', error.message);
        res.status(500).json({ error: error.message });
      }
    }
    
    
    export const getallLive = async (req, res) => {
      try {

        const limit = parseInt(req.query.limit) || 100;

        // 1. Query the database to get all blog
        const result = await db.query(`
          SELECT live_id, link, name, tag
          FROM "Live" ORDER BY live_id DESC LIMIT $1
        `, [limit]);

        const sum = await db.query('SELECT COUNT(*) FROM "Live"');
        const total = sum.rows[0].count;
    
        // 2. Check if any live are found
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'No live found' });
        }

        const data = result.rows
    
        // 3. Respond with all live
        res.json({data, total});
      } catch (error) {
        // Error handling
        console.error('Error retrieving live:', error.message);
        res.status(500).json({ error: error.message });
      }
    }

    export const updateLive = async (req, res) => {
      try {
        const { live_id } = req.params;

        const { link, name, tag } = req.body;
        
        // First check if live exists
        const live = await db.query('SELECT * FROM "Live" WHERE live_id = $1', [live_id]);
        if (live.rows.length === 0) {
          return res.status(404).json({ message: 'Live not found' });
        }
    
        const result = await db.query(
          'UPDATE "Live" SET link = $2, name = $3, tag = $4 WHERE live_id = $1 RETURNING *',
          [live_id, link, name, tag]
        );
        
        res.json(result.rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    export const deleteLive = async (req, res) => {

      const { live_id } = req.params;
    
      try {
        // Check if the live exists
        const liveResult = await db.query('SELECT * FROM "Live" WHERE live_id = $1', [live_id]);
        if (liveResult.rows.length === 0) {
          return res.status(404).json({ message: 'Live not found' });
        }
    
        // Delete the live from the database
        const deleteResult = await db.query('DELETE FROM "Live" WHERE live_id = $1 RETURNING *', [live_id]);
    
        // Check if the deletion was successful (returning deleted live)
        if (deleteResult.rows.length === 0) {
          return res.status(500).json({ message: 'Failed to delete live' });
        }
    
        // Respond with a success message
        res.json({ message: 'Live deleted successfully', live_id: live_id });
      } catch (error) {
        // Error handling
        console.error('Error deleting live:', error.message);
        res.status(500).json({ error: error.message });
      }
    }