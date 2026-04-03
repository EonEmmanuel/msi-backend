import db from '../db.js'

export const createArticle = async (req, res, next) => {

    try {
        const { image, title, desc, category, international, tag, editor, read_time, created_at } = req.body;

        const blog = await db.query('SELECT * FROM "Article" WHERE title = $1', [title]);
          
          if (blog.rows.length > 0) {
            return res.status(404).json({ message:'Article Already Exist'});
          }

      const slug = `${title}`
        .toLowerCase()
        .replace(/\s+/g, "-");
        
        const result = await db.query(
          'INSERT INTO "Article" (slug, image, title, "desc", category, international, tag, editor, read_time, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
          [slug, image, title, desc, category, international, tag, editor, read_time, created_at]
        );
        res.status(201).json(result.rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
    
    export const getArticle = async (req, res) => {

      const { slug } = req.params;
    
      try {
        // 1. Query the database to get the blog
        const result = await db.query(`
          SELECT slug, image, title, "desc", category, international, tag, editor, read_time, created_at
          FROM "Article"
          WHERE slug = $1
        `, [slug]);
    
        // 2. If no player is found, return a 404 response
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Blog not found' });
        }
    
        // 3. Respond with the blog data
        res.json(result.rows[0]);
      } catch (error) {
        // Error handling
        console.error('Error retrieving blog:', error.message);
        res.status(500).json({ error: error.message });
      }
    }

    export const getArticleId = async (req, res) => {

      const { article_id } = req.params;
    
      try {
        // 1. Query the database to get the blog
        const result = await db.query(`
          SELECT slug, image, title, "desc", category, international, tag, editor, read_time, created_at
          FROM "Article"
          WHERE article_id = $1
        `, [article_id]);
    
        // 2. If no player is found, return a 404 response
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Blog not found' });
        }
    
        // 3. Respond with the blog data
        res.json(result.rows[0]);
      } catch (error) {
        // Error handling
        console.error('Error retrieving blog:', error.message);
        res.status(500).json({ error: error.message });
      }
    }
    
    
    export const getallArticle = async (req, res) => {
      try {

        const limit = parseInt(req.query.limit) || 100;

        // 1. Query the database to get all blog
        const result = await db.query(`
          SELECT article_id, slug, image, title, "desc", category, international, tag, editor, read_time, created_at
          FROM "Article" ORDER BY article_id DESC LIMIT $1
        `, [limit]);

        const sum = await db.query('SELECT COUNT(*) FROM "Article"');
        const total = sum.rows[0].count;
    
        // 2. Check if any blog are found
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'No blog found' });
        }

        const data = result.rows
    
        // 3. Respond with all blog
        res.json({data, total});
      } catch (error) {
        // Error handling
        console.error('Error retrieving blog:', error.message);
        res.status(500).json({ error: error.message });
      }
    }

    export const updateArticle = async (req, res) => {
      try {
        const { article_id } = req.params;

        const { image, title, desc, category, international, tag, editor, read_time, created_at } = req.body;

        const slug = `${title}`
        .toLowerCase()
        .replace(/\s+/g, "-");
        
        
        // First check if blog exists
        const blog = await db.query('SELECT * FROM "Article" WHERE article_id = $1', [article_id]);
        if (blog.rows.length === 0) {
          return res.status(404).json({ message: 'Article not found' });
        }
    
        const result = await db.query(
          'UPDATE "Article" SET image = $2, slug = $3, title = $4, "desc" = $5, category = $6, international = $7, tag = $8, editor = $9, read_time = $10, created_at = $11 WHERE article_id = $1 RETURNING *',
          [article_id, image, slug, title, desc, category, international, tag, editor, read_time, created_at]
        );
        
        res.json(result.rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    export const deleteArticle = async (req, res) => {

      const { article_id } = req.params;
    
      try {
        // Check if the blog exists
        const blogResult = await db.query('SELECT * FROM "Article" WHERE article_id = $1', [article_id]);
        if (blogResult.rows.length === 0) {
          return res.status(404).json({ message: 'Blog not found' });
        }
    
        // Delete the blog from the database
        const deleteResult = await db.query('DELETE FROM "Article" WHERE article_id = $1 RETURNING *', [article_id]);
    
        // Check if the deletion was successful (returning deleted blog)
        if (deleteResult.rows.length === 0) {
          return res.status(500).json({ message: 'Failed to delete blog' });
        }
    
        // Respond with a success message
        res.json({ message: 'Blog deleted successfully', article_id: article_id });
      } catch (error) {
        // Error handling
        console.error('Error deleting blog:', error.message);
        res.status(500).json({ error: error.message });
      }
    }