import db from '../db.js';  // Assuming you are using a db module for your PostgreSQL queries

export const createStanding = async (req, res) => {

  try {
    const { matches, win, draw, losses, goal_conc, goal_sc, pointes, goal_st, team } = req.body;

    // Check if team_id exists in the Team table (i.e., foreign key validation)
    const teamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [team]);
    
    if (teamCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Team not found' });
    }

    // Insert the new player into the Player table
    const result = await db.query(
      'INSERT INTO "Standing" (matches, win, draw, losses, goal_conc, goal_sc, pointes, goal_st, team) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [matches, win, draw, losses, goal_conc, goal_sc, pointes, goal_st, team]
    );
    
    const newStanding = result.rows;  // Assuming `result.rows` contains the inserted player

    res.status(201).json(newStanding);  // Respond with the newly created player
  } catch (error) {
    console.error(error)
  }
};

export const getStanding = async (req, res) => {
  const { stand_id } = req.params;
  
  try {
    // 1. Query the database to get the player with team details
    const result = await db.query(`
      SELECT s.team, s.stand_id, s.matches, s.win, s.draw, s.losses, s.goal_conc, s.goal_sc, s.pointes, s.goal_st, t.league, t.team_id, t.name, t.logo, t.abv,
      l.name AS league_name, l.abv AS league_abv
      FROM "Standing" s
      JOIN "Team" t ON s.team = t.team_id WHERE s.stand_id = $1
      JOIN "League" l ON t.league = l.league_id
    `, [stand_id]);

    // 2. If no player is found, return a 404 response
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Standing not found' });
    }

    // 3. Respond with the player data along with the team details
    res.json(result.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error retrieving standing:', error.message);
    res.status(500).json({ error: error.message });
  }
}


export const getAllStanding = async (req, res) => {

  const limit = parseInt(req.query.limit) || 100;
  
    try {
      // 1. Query the database to get the player with team details
      const result = await db.query(`
        SELECT 
  s.stand_id, 
  s.matches, 
  s.win, 
  s.draw, 
  s.team, 
  s.losses, 
  s.goal_conc, 
  s.goal_sc, 
  s.pointes, 
  s.goal_st,
  t.league, 
  t.team_id, 
  t.name, 
  t.logo, 
  t.abv,
  l.name AS league_name, 
  l.abv AS league_abv
    FROM "Standing" s
    JOIN "Team" t ON s.team = t.team_id
    JOIN "League" l ON t.league = l.league_id
    ORDER BY s.pointes::INTEGER DESC, s.goal_st::INTEGER DESC, s.goal_sc::INTEGER DESC
    LIMIT $1;
      `, [limit]);

      const sum = await db.query('SELECT COUNT(*) FROM "Standing"');
      const total = sum.rows[0].count;
  
      // 2. If no player is found, return a 404 response
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Standing not found' });
      }

      const data = result.rows
  
      // 3. Respond with the player data along with the team details
      res.json({data, total});
    } catch (error) {
      // Error handling
      console.error('Error retrieving standing:', error.message);
      res.status(500).json({ error: error.message });
    }
}

export const updateStanding = async (req, res) => {

  const { stand_id } = req.params;
  const { matches, win, draw, losses, goal_conc, goal_sc, pointes, goal_st, team } = req.body;

  try {
    // 1. First, check if the team_id exists in the team table
    const teamResult = await db.query('SELECT * FROM "Team" WHERE team_id = $1', [team]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // 2. Check if the standing exists in the standing table
    const standingResult = await db.query('SELECT * FROM "Standing" WHERE stand_id = $1', [stand_id]);
    if (standingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Standing not found' });
    }

    // 3. Update the player details
    const updateQuery = `
      UPDATE "Standing"
      SET matches = $2, win = $3, draw = $4, losses = $5, goal_conc = $6, goal_sc = $7, pointes = $8, goal_st = $9, team = $10
      WHERE stand_id = $1
      RETURNING *;
    `;
    const updatedPlayer = await db.query(updateQuery, [
      stand_id,
      matches,
      win,
      draw,
      losses,
      goal_conc,
      goal_sc,
      pointes,
      goal_st,
      team
    ]);

    // 4. Respond with the updated player data
    res.json(updatedPlayer.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error updating player:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const deleteStanding = async (req, res) => {
  const { stand_id } = req.params;

  try {
    // Check if the standing exists
    const standingResult = await db.query('SELECT * FROM "Standing" WHERE stand_id = $1', [stand_id]);
    if (standingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Standing not found' });
    }

    // Delete the standing from the database
    const deleteResult = await db.query('DELETE FROM "Standing" WHERE stand_id = $1 RETURNING *', [stand_id]);

    // Check if the deletion was successful (returning deleted standing)
    if (deleteResult.rows.length === 0) {
      return res.status(500).json({ message: 'Failed to delete standing' });
    }

    // Respond with a success message
    res.json({ message: 'Standing deleted successfully', stand_id: stand_id });
  } catch (error) {
    // Error handling
    console.error('Error deleting standing:', error.message);
    res.status(500).json({ error: error.message });
  }
}
