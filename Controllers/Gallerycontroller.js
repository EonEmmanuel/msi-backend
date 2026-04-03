import db from '../db.js'

export const createGallery = async (req, res, next) => {

    try {
        const { photo, name, role, desc } = req.body;

        const namecheck = await db.query('SELECT * FROM "Gallery" WHERE name = $1', [name]);
          
          if (namecheck.rows.length > 0) {
            return res.status(404).json({ message:'Name Already Exist'});
          }
        
        const rolecheck = await db.query('SELECT * FROM "Gallery" WHERE role = $1', [role]);
          
          if (rolecheck.rows.length > 0) {
            return res.status(404).json({ message:'Role Already Exist'});
          }
        
        const result = await db.query(
          'INSERT INTO "Gallery" (photo, name, role, "desc") VALUES ($1, $2, $3, $4) RETURNING *',
          [photo, name, role, desc]
        );
        res.status(201).json(result.rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
    

    export const getGallery = async (req, res) => {

      const { gallery_id } = req.params;
    
      try {
        // 1. Query the database to get the blog
        const result = await db.query(`
          SELECT photo, name, role, "desc"
          FROM "Gallery"
          WHERE gallery_id = $1
        `, [gallery_id]);
    
        // 2. If no player is found, return a 404 response
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Gallery not found' });
        }
    
        // 3. Respond with the gallery data
        res.json(result.rows[0]);
      } catch (error) {
        // Error handling
        console.error('Error retrieving gallery:', error.message);
        res.status(500).json({ error: error.message });
      }
    }
    
    
    export const getallGallery = async (req, res) => {
      try {

        const limit = parseInt(req.query.limit) || 100;

        // 1. Query the database to get all blog
        const result = await db.query(`
          SELECT gallery_id, photo, name, role, "desc"
          FROM "Gallery" ORDER BY gallery_id DESC LIMIT $1
        `, [limit]);

        const sum = await db.query('SELECT COUNT(*) FROM "Gallery"');
        const total = sum.rows[0].count;
    
        // 2. Check if any gallery are found
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'No gallery found' });
        }

        const data = result.rows
    
        // 3. Respond with all gallery
        res.json({data, total});
      } catch (error) {
        // Error handling
        console.error('Error retrieving blog:', error.message);
        res.status(500).json({ error: error.message });
      }
    }

    export const updateGallery = async (req, res) => {
      try {
        const { gallery_id } = req.params;

        const { photo, name, role, desc } = req.body;
        
        // First check if gallery exists
        const gallery = await db.query('SELECT * FROM "Gallery" WHERE gallery_id = $1', [gallery_id]);
        if (gallery.rows.length === 0) {
          return res.status(404).json({ message: 'Gallery not found' });
        }
    
        const result = await db.query(
          'UPDATE "Gallery" SET photo = $2, name = $3, role = $4, "desc" = $5 WHERE gallery_id = $1 RETURNING *',
          [gallery_id, photo, name, role, desc]
        );
        
        res.json(result.rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    export const deleteGallery = async (req, res) => {

      const { gallery_id } = req.params;
    
      try {
        // Check if the gallery exists
        const galleryResult = await db.query('SELECT * FROM "Gallery" WHERE gallery_id = $1', [gallery_id]);
        if (galleryResult.rows.length === 0) {
          return res.status(404).json({ message: 'Gallery not found' });
        }
    
        // Delete the gallery from the database
        const deleteResult = await db.query('DELETE FROM "Gallery" WHERE gallery_id = $1 RETURNING *', [gallery_id]);
    
        // Check if the deletion was successful (returning deleted gallery)
        if (deleteResult.rows.length === 0) {
          return res.status(500).json({ message: 'Failed to delete gallery' });
        }
    
        // Respond with a success message
        res.json({ message: 'Gallery deleted successfully', gallery_id: gallery_id });
      } catch (error) {
        // Error handling
        console.error('Error deleting gallery:', error.message);
        res.status(500).json({ error: error.message });
      }
    }