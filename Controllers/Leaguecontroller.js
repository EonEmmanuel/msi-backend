import db from '../db.js';  // Assuming you are using a db module for your PostgreSQL queries

export const createLeague = async (req, res) => {

  try {
    const { name, abv, logo, themecolor } = req.body;

    // Insert the new player into the Player table
    const result = await db.query(
      'INSERT INTO "League" ( name, abv, logo, themecolor ) VALUES ($1, $2, $3, $4) RETURNING *',
      [ name, abv, logo, themecolor ]
    );
    
    const newLeague = result.rows[0];  // Assuming `result.rows` contains the inserted scorer

    res.status(201).json(newLeague);  // Respond with the newly created scorer
  } catch (error) {
    console.error(error)
  }
};

export const getLeague = async (req, res) => {

  const { league_id } = req.params;

  try {
    // 1. Query the database to get the scorer with team details
    const result = await db.query(`
      SELECT name, abv, logo, themecolor
      FROM "League" 
      WHERE league_id = $1
    `, [league_id]);

    // 2. If no scorer is found, return a 404 response
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'League not found' });
    }

    // 3. Respond with the scorer data along with the player details
    res.json(result.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error retrieving Market:', error.message);
    res.status(500).json({ error: error.message });
  }
}


export const getAllLeague = async (req, res) => {
  try {
    // 1. Query the database to get all players along with their team details
    const result = await db.query(`
      SELECT league_id, name, abv, logo, themecolor
      FROM "League" 
      ORDER BY league_id DESC
    `);

      const sum = await db.query('SELECT COUNT(*) FROM "League"');
      const total = sum.rows[0].count;

    // 2. Check if any scorers are found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No League found' });
    }

    const data = result.rows

    // 3. Respond with all scorers along with their player details
    res.json({data, total});
  } catch (error) {
    // Error handling
    console.error('Error retrieving scorers:', error.message);
    res.status(500).json({ error: error.message });
  }
}


export const updateLeague = async (req, res) => {

  const { league_id } = req.params;

  const { name, abv, logo, themecolor } = req.body;

  try {
    // 1. First, check if the team_id exists in the team table
    const scorerResult = await db.query('SELECT * FROM "League" WHERE league_id = $1', [league_id]);
    if (scorerResult.rows.length === 0) {
      return res.status(404).json({ message: 'League not found' });
    }

    // 3. Update the player details
    const updateQuery = `
      UPDATE "League"
      SET name = $2, abv = $3, logo = $4, themecolor = $5
      WHERE league_id = $1
      RETURNING *;
    `;
    const updatedLeague = await db.query(updateQuery, [
      league_id,
      name,
      abv,
      logo,
      themecolor
    ]);

    // 4. Respond with the updated player data
    res.json(updatedLeague.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error updating market:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const deleteLeague = async (req, res) => {

  const { league_id } = req.params;

  try {
    // Check if the scorer exists
    const scorerResult = await db.query('SELECT * FROM "League" WHERE league_id = $1', [league_id]);
    if (scorerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Scorer not found' });
    }

    // Delete the scorer from the database
    const deleteResult = await db.query('DELETE FROM "League" WHERE league_id = $1 RETURNING *', [league_id]);

    // Check if the deletion was successful (returning deleted scorer)
    if (deleteResult.rows.length === 0) {
      return res.status(500).json({ message: 'Failed to delete scorer' });
    }

    // Respond with a success message
    res.json({ message: 'league deleted successfully', league_id: league_id });
  } catch (error) {
    // Error handling
    console.error('Error deleting league:', error.message);
    res.status(500).json({ error: error.message });
  }
}
