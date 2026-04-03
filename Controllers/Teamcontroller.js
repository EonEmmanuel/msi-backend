import db from '../db.js'

export const createTeam = async (req, res, next) => {

    try {
        const { name, logo, abv, league } = req.body;

        const team = await db.query('SELECT * FROM "Team" WHERE name = $1', [name]);
          
          if (team.rows.length > 0) {
            return res.status(404).json({ message:'Team Already Exist'});
          }
        
        const result = await db.query(
          'INSERT INTO "Team" (name, logo, abv, league) VALUES ($1, $2, $3, $4) RETURNING *',
          [name, logo, abv, league]
        );
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

export const getTeam = async (req, res) => {

  const { team_id } = req.params;

  try {
    // Query the database to get the team by team_id
    const result = await db.query('SELECT * FROM "Team" WHERE team_id = $1', [team_id]);

    // If no team found, return 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Return the team details
    res.json(result.rows[0]);
  } catch (error) {
    // Catch and handle errors
    console.error('Error retrieving team:', error.message);
    res.status(500).json({ error: error.message });
  }
 }

 export const getAllTeam = async (req, res) => {
 
  const limit = parseInt(req.query.limit) || 100;

  try {
    // 1. Query the database to get all teams
    const result = await db.query(`
      SELECT team_id, name, logo, abv, league
      FROM "Team" 
      ORDER BY team_id DESC LIMIT $1
    `, [limit]);

    const sum = await db.query('SELECT COUNT(*) FROM "Team"');
    const total = sum.rows[0].count;

    // 2. Check if any teams are found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No teams found' });
    }

    const data = result.rows

    // 3. Respond with all teams
    res.json({data, total});
  } catch (error) {
    // Error handling
    console.error('Error retrieving teams:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const updateTeam = async (req, res) => {
  try {
    const { team_id } = req.params;
    const { name, logo, abv, league } = req.body;
    
    // First check if team exists
    const team = await db.query('SELECT * FROM "Team" WHERE team_id = $1', [team_id]);
    if (team.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const result = await db.query(
      'UPDATE "Team" SET name = $2, logo = $3, abv = $4, league = $5 WHERE team_id = $1 RETURNING *',
      [team_id, name, logo, abv, league]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const deleteTeam = async (req, res) => {
  const { team_id } = req.params;

  try {
    // Check if the team exists
    const teamResult = await db.query('SELECT * FROM "Team" WHERE team_id = $1', [team_id]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Delete the team from the database
    const deleteResult = await db.query('DELETE FROM "Team" WHERE team_id = $1 RETURNING *', [team_id]);

    // Check if the deletion was successful (returning deleted team)
    if (deleteResult.rows.length === 0) {
      return res.status(500).json({ message: 'Failed to delete team' });
    }

    // Respond with a success message
    res.json({ message: 'Team deleted successfully', team_id: team_id });
  } catch (error) {
    // Error handling
    console.error('Error deleting team:', error.message);
    res.status(500).json({ error: error.message });
  }
}

