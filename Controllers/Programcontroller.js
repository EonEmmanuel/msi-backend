import db from '../db.js';  // Assuming you are using a db module for your PostgreSQL queries

export const createProgram = async (req, res) => {

  try {
    const { image, name, p_image, desc, time, occurence, duration, tag, unique, themecolor } = req.body;

    // Check if team_id exists in the Team table (i.e., foreign key validation)
    const Check = await db.query('SELECT name FROM "Program" WHERE name = $1', [name]);
    
    if (Check.rows.length > 0) {
      return res.status(400).json({ error: 'Program already Exist' });
    }

    // Insert the new player into the Player table
    const result = await db.query(
      'INSERT INTO "Program" ( image, name, p_image, "desc", time, occurence, duration, tag, "unique", themecolor ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [ image, name, p_image, desc, time, occurence, duration, tag, unique, themecolor ]
    );
    
    const newProgram = result.rows;  // Assuming `result.rows` contains the inserted player

    res.status(201).json(newProgram);  // Respond with the newly created player
  } catch (error) {
    console.error(error)
  }
};

export const getProgram = async (req, res) => {

  const { program_id } = req.params;
  
  try {
    // 1. Query the database to get the player with team details
    const result = await db.query(`
      SELECT program_id, image, name, p_image, "desc", time, occurence, duration, tag, live, "unique", themecolor
      FROM "Program"
      WHERE program_id = $1
    `, [program_id]);

    // 2. If no player is found, return a 404 response
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // 3. Respond with the player data along with the team details
    res.json(result.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error retrieving Program:', error.message);
    res.status(500).json({ error: error.message });
  }
}


export const getAllProgram = async (req, res) => {

  const limit = parseInt(req.query.limit) || 100;
  
    try {
      // 1. Query the database to get the player with team details
      const result = await db.query(`
      SELECT program_id, image, name, p_image, "desc", time, occurence, duration, tag, live, "unique", themecolor
      FROM "Program"
      ORDER BY program_id ASC
      LIMIT $1;
      `, [limit]);

      const sum = await db.query('SELECT COUNT(*) FROM "Program"');
      const total = sum.rows[0].count;
  
      // 2. If no player is found, return a 404 response
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Program not found' });
      }

      const data = result.rows
  
      // 3. Respond with the player data along with the team details
      res.json({data, total});
    } catch (error) {
      // Error handling
      console.error('Error retrieving program:', error.message);
      res.status(500).json({ error: error.message });
    }
}

export const updateProgram = async (req, res) => {

  const { program_id } = req.params;
  
  const { image, name, p_image, desc, time, occurence, duration, live, tag, unique, themecolor } = req.body;

  try {

    // 2. Check if the standing exists in the standing table
    const standingResult = await db.query('SELECT * FROM "Program" WHERE program_id = $1', [program_id]);
    if (standingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // 3. Update the player details
    const updateQuery = `
      UPDATE "Program"
      SET image = $2, name = $3, p_image = $4, "desc" = $5, time = $6, occurence = $7, duration = $8, live = $9, "unique" = $10, themecolor = $11, tag = $12
      WHERE program_id = $1
      RETURNING *;
    `;
    const updatedProgram = await db.query(updateQuery, [
      program_id,
      image, 
      name, 
      p_image, 
      desc, 
      time, 
      occurence,
      duration, 
      live, 
      unique,
      themecolor,
      tag
    ]);

    // 4. Respond with the updated player data
    res.json(updatedProgram.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error updating program:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const deleteProgram = async (req, res) => {

  const { program_id } = req.params;

  try {
    // Check if the standing exists
    const standingResult = await db.query('SELECT * FROM "Program" WHERE program_id = $1', [program_id]);
    if (standingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Delete the standing from the database
    const deleteResult = await db.query('DELETE FROM "Program" WHERE program_id = $1 RETURNING *', [program_id]);

    // Check if the deletion was successful (returning deleted standing)
    if (deleteResult.rows.length === 0) {
      return res.status(500).json({ message: 'Failed to delete program' });
    }

    // Respond with a success message
    res.json({ message: 'Program deleted successfully', program_id: program_id });

  } catch (error) {
    // Error handling
    console.error('Error deleting program:', error.message);
    res.status(500).json({ error: error.message });
  }
}
