import db from "../db.js";

export const createFixture = async (req, res) => {

    try {
      const { matchday, home_team, away_team, upcoming, date, time, venue, ft } = req.body;
  
        
      const hometeamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [home_team]);
      
      if (hometeamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Home Team not found' });
      }

      const awayteamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [away_team]);
      
      if (awayteamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Away Team not found' });
      }
      // Insert the new player into the Player table
      const result = await db.query(
        'INSERT INTO "Fixture_Matchday" (matchday, home_team, away_team, upcoming, date, time, venue, ft) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [matchday, home_team, away_team, upcoming, date, time, venue, ft]
      );
      
      const newMatchday = result.rows;  // Assuming `result.rows` contains the inserted player
  
      res.status(201).json(newMatchday);  // Respond with the newly created player
    } catch (error) {
      console.error(error)
    }
  };
  
  export const getFixture = async (req, res) => {
    
    const { fixture_id } = req.params;
  
    try {
      // 1. Query the database to get the player with team details
      const result = await db.query(`
        SELECT f.home_team, f.away_team, f.date, f.time, f.venue, f.live, f.home_score, f.away_score, f.ft, f.matchday, f.upcoming, th.league, th.name AS home_team_name, th.logo AS home_team_logo, th.abv AS home_team_abv,
         ta.name AS away_team_name, ta.logo AS away_team_logo, ta.abv AS away_team_abv, l.name AS league_name, l.abv AS league_abv, l.themecolor AS league_color
        FROM "Fixture_Matchday" f
        JOIN "Team" th ON f.home_team = th.team_id 
        JOIN "Team" ta ON f.away_team = ta.team_id
        JOIN "League" l ON th.league = l.league_id
        WHERE f.fixture_id = $1
      `, [fixture_id]);
  
      // 2. If no player is found, return a 404 response
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Fixture not found' });
      }
  
      // 3. Respond with the player data along with the team details
      res.json(result.rows[0]);
    } catch (error) {
      // Error handling
      console.error('Error retrieving fixture:', error.message);
      res.status(500).json({ error: error.message });
    }
  }  
  
  export const getAllFixture = async (req, res) => {
    try {

      const limit = parseInt(req.query.limit) || 100
      // 1. Query the database to get all players along with their team details
      const result = await db.query(`
        SELECT f.fixture_id, f.home_team, f.away_team, f.date, f.time, f.venue, f.live, f.home_score, f.away_score, f.ft, f.matchday, f.upcoming, th.league, th.name AS home_team_name, th.logo AS home_team_logo, th.abv AS home_team_abv,
        ta.name AS away_team_name, ta.logo AS away_team_logo, ta.abv AS away_team_abv, l.name AS league_name, l.abv AS league_abv, l.themecolor
        FROM "Fixture_Matchday" f
        JOIN "Team" th ON f.home_team = th.team_id 
        JOIN "Team" ta ON f.away_team = ta.team_id
        JOIN "League" l ON th.league = l.league_id
        ORDER BY f.fixture_id DESC LIMIT $1
        `, [limit]);
  
      // 2. Check if any players are found
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No fixture found' });
      }
  
      // 3. Respond with all players along with their team details
      res.json(result.rows);
    } catch (error) {
      // Error handling
      console.error('Error retrieving fixtures:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  
  
  export const updateFixture = async (req, res) => {
  
    const { fixture_id } = req.params;

    const { matchday, home_team, away_team, date, time, venue, live, upcoming, home_score, away_score, ft } = req.body;
  
    try {
        
      const hometeamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [home_team]);
      
      if (hometeamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Home Team not found' });
      }

      const awayteamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [away_team]);
      
      if (awayteamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Away Team not found' });
      }
  
      // 2. Check if the player exists in the player table
      const playerResult = await db.query('SELECT * FROM "Fixture_Matchday" WHERE fixture_id = $1', [fixture_id]);
      if (playerResult.rows.length === 0) {
        return res.status(404).json({ message: 'fixture not found' });
      }
  
      // 3. Update the player details
      const updateQuery = `
        UPDATE "Fixture_Matchday"
        SET matchday = $2, home_team = $3, away_team = $4, date = $5, time = $6, venue = $7, live = $8, home_score = $9, away_score = $10, ft = $11, upcoming = $12 
        WHERE fixture_id = $1
        RETURNING *;
      `;
      const updatedFixture = await db.query(updateQuery, [
        fixture_id,
        matchday, 
        home_team, 
        away_team, 
        date, 
        time, 
        venue,
        live,
        home_score,
        away_score,
        ft,
        upcoming
      ]);
  
      // 4. Respond with the updated player data
      res.json(updatedFixture.rows[0]);
    } catch (error) {
      // Error handling
      console.error('Error updating fixture:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
  
  export const deleteFixture = async (req, res) => {

    const { fixture_id } = req.params;
  
    try {
      // Check if the player exists
      const fixtureResult = await db.query('SELECT * FROM "Fixture_Matchday" WHERE fixture_id = $1', [fixture_id]);
      if (fixtureResult.rows.length === 0) {
        return res.status(404).json({ message: 'fixture not found' });
      }
  
      // Delete the player from the database
      const deleteResult = await db.query('DELETE FROM "Fixture_Matchday" WHERE fixture_id = $1 RETURNING *', [fixture_id]);
  
      // Check if the deletion was successful (returning deleted player)
      if (deleteResult.rows.length === 0) {
        return res.status(500).json({ message: 'Failed to delete fixture' });
      }
  
      // Respond with a success message
      res.json({ message: 'Fixture deleted successfully', Fixture: fixture_id });
    } catch (error) {
      // Error handling
      console.error('Error deleting fixture:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
  

  export const createResMatchday = async (req, res, next) => {

    try {
        const { matchday, status } = req.body;
        
        const result = await db.query(
          'INSERT INTO "Res_Matchday" ( matchday, status ) VALUES ($1, $2) RETURNING *',
        [ matchday, status ]
        );
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

export const getResMatchday = async (req, res) => {
  const { matchday_id } = req.params;

  try {
    // Query the database to get the team by team_id
    const result = await db.query('SELECT * FROM "Res_Matchday" WHERE matchday_id = $1', [matchday_id]);

    // If no team found, return 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Matchday not found' });
    }

    // Return the team details
    res.json(result.rows[0]);
  } catch (error) {
    // Catch and handle errors
    console.error('Error retrieving Matchday:', error.message);
    res.status(500).json({ error: error.message });
  }
 }

 export const getAllResMatchday = async (req, res) => {
  try {

    const limit = parseInt(req.query.limit) || 500;
    // 1. Query the database to get all teams
    const result = await db.query(`
      SELECT matchday_id, matchday, status
      FROM "Res_Matchday" ORDER BY matchday_id DESC LIMIT $1
      `, [limit]);

    // 2. Check if any teams are found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No Matchday found' });
    }

    // 3. Respond with all teams
    res.json(result.rows);
  } catch (error) {
    // Error handling
    console.error('Error retrieving matchdays:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const updateResMatchday = async (req, res) => {
  try {
    const { matchday_id } = req.params;
    const { matchday, status } = req.body;
    
    // First check if team exists
    const team = await db.query('SELECT * FROM "Res_Matchday" WHERE matchday_id = $1', [matchday_id]);
    if (team.rows.length === 0) {
      return res.status(404).json({ message: 'Matchday not found' });
    }

    const result = await db.query(
      'UPDATE "Res_Matchday" SET matchday = $2, status = $3 WHERE matchday_id = $1 RETURNING *',
      [matchday_id, matchday, status]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const deleteResMatchday = async (req, res) => {
  const { matchday_id } = req.params;

  try {
    // Check if the team exists
    const teamResult = await db.query('SELECT * FROM "Res_Matchday" WHERE matchday_id = $1', [matchday_id]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'Matchday not found' });
    }

    await db.query('DELETE FROM "Result_Matchday" WHERE matchday = $1', [matchday_id]);

    // Delete the team from the database
    const deleteResult = await db.query('DELETE FROM "Res_Matchday" WHERE matchday_id = $1 RETURNING *', [matchday_id]);

    // Check if the deletion was successful (returning deleted team)
    if (deleteResult.rows.length === 0) {
      return res.status(500).json({ message: 'Failed to delete matchday' });
    }

    // Respond with a success message
    res.json({ message: 'Matchday deleted successfully', Matchday: matchday_id });
  } catch (error) {
    // Error handling
    console.error('Error deleting team:', error.message);
    res.status(500).json({ error: error.message });
  }
}


export const createResult = async (req, res) => {

    try {
      const { matchday, home_team, away_team, home_team_score, away_team_score, goals, yellow_cards, red_cards } = req.body;
      
      // Check if team_id exists in the Team table (i.e., foreign key validation)
      
      const matchdayCheck = await db.query('SELECT matchday_id FROM "Res_Matchday" WHERE matchday_id = $1', [matchday]);
            
      if (matchdayCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Matchday not found' });
      }
        
      const hometeamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [home_team]);
      
      if (hometeamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Home Team not found' });
      }

      const awayteamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [away_team]);
      
      if (awayteamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Away Team not found' });
      }
      // Insert the new player into the Player table
      const result = await db.query(
        'INSERT INTO "Result_Matchday" (matchday, home_team, away_team, home_team_score, away_team_score, goals, yellow_cards, red_cards) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb) RETURNING *',
        [matchday, home_team, away_team, home_team_score, away_team_score, JSON.stringify(goals), JSON.stringify(yellow_cards), JSON.stringify(red_cards)]
      );
      
      const newMatchday = result.rows;  // Assuming `result.rows` contains the inserted player
  
      res.status(201).json(newMatchday);  // Respond with the newly created player
    } catch (error) {
      console.error("Error inserting result:", error);
    res.status(500).json({ error: "Internal server error" });
    }
  };
  
  export const getResult = async (req, res) => {
    const { result_id } = req.params;
  
    try {
      // 1. Query the database to get the player with team details
      const result = await db.query(`
        SELECT r.home_team, r.away_team, r.home_team_score, r.away_team_score, r.matchday, th.league, th.name AS home_team_name, th.logo AS home_team_logo, th.abv AS home_team_abv,
         ta.name AS away_team_name, ta.logo AS away_team_logo, ta.abv AS away_team_abv, m.matchday AS match_day, m.status, l.name AS league_name, l.abv AS league_abv
        FROM "Result_Matchday" r
        JOIN "Team" th ON r.home_team = th.team_id 
        JOIN "Team" ta ON r.away_team = ta.team_id 
        JOIN "Res_Matchday" m ON r.matchday = m.matchday_id
        JOIN "League" l ON th.league = l.league_id
        WHERE r.result_id = $1
      `, [result_id]);
  
      // 2. If no player is found, return a 404 response
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Result not found' });
      }
  
      // 3. Respond with the player data along with the team details
      res.json(result.rows[0]);
    } catch (error) {
      // Error handling
      console.error('Error retrieving result:', error.message);
      res.status(500).json({ error: error.message });
    }
  }  
  
  export const getAllResult = async (req, res) => {
    try {

      const limit = parseInt(req.query.limit) || 500;
      // 1. Query the database to get all players along with their team details
      const result = await db.query(`
        SELECT
    r.result_id,
    r.matchday,
    r.home_team, 
    r.away_team, 
    r.home_team_score, 
    r.away_team_score,
    th.league,
    th.name AS home_team_name,
    th.logo AS home_team_logo,
    th.abv AS home_team_abv,
    ta.name AS away_team_name,
    ta.logo AS away_team_logo,
    ta.abv AS away_team_abv,
    m.matchday AS match_day,
    m.status, 
    l.name AS league_name, 
    l.abv AS league_abv
  FROM "Result_Matchday" r
  JOIN "Team" th ON r.home_team = th.team_id
  JOIN "Team" ta ON r.away_team = ta.team_id
  LEFT JOIN "Res_Matchday" m ON r.matchday = m.matchday_id
  JOIN "League" l ON th.league = l.league_id
  ORDER BY r.result_id DESC LIMIT $1
        `, [limit]);
  
      // 2. Check if any players are found
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No Results found' });
      }
  
      // 3. Respond with all players along with their team details
      res.json(result.rows);
    } catch (error) {
      // Error handling
      console.error('Error retrieving results:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

export const getMatchResults = async (req, res) => {

  const { result_id } = req.params;

  try {
    const query = `
    SELECT
    r.result_id,
    r.matchday,
    r.home_team, r.away_team, r.home_team_score, r.away_team_score,
    th.name AS home_team_name,
    th.logo AS home_team_logo,
    th.abv AS home_team_abv,
    ta.name AS away_team_name,
    ta.logo AS away_team_logo,
    ta.abv AS away_team_abv,
    m.matchday AS match_day,
    m.status,
    l.name AS league_name,
    l.abv AS league_abv
  FROM "Result_Matchday" r
  JOIN "Team" th ON r.home_team = th.team_id
  JOIN "Team" ta ON r.away_team = ta.team_id
  JOIN "Res_Matchday" m ON r.matchday = m.matchday_id
  JOIN "League" l ON th.league = l.league_id
  WHERE r.result_id = $1;
    `;
    const result = await db.query(query, [result_id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching match result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllMatchResults = async (req, res) => {

  const { matchday } = req.params

  try {
    const query = `
    SELECT
    r.result_id,
    r.matchday,
    r.home_team, r.away_team, r.home_team_score, r.away_team_score,
    th.name AS home_team_name,
    th.logo AS home_team_logo,
    th.abv AS home_team_abv,
    ta.name AS away_team_name,
    ta.logo AS away_team_logo,
    ta.abv AS away_team_abv,
    m.matchday AS match_day,
    m.status,
    l.name AS league_name,
    l.abv AS league_abv
  FROM "Result_Matchday" r
  JOIN "Team" th ON r.home_team = th.team_id
  JOIN "Team" ta ON r.away_team = ta.team_id
  LEFT JOIN "Res_Matchday" m ON r.matchday = m.matchday_id
  JOIN "League" l ON th.league = l.league_id
  WHERE r.matchday = $1;
    `;
    const result = await db.query(query, [matchday]);
    res.json(result.rows);
  
  } catch (err) {
    console.error("Error fetching match result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

  
  
  export const updateResult = async (req, res) => {
  
    const {result_id } = req.params;
    const { matchday, home_team, away_team, home_team_score, away_team_score } = req.body;
  
    try {
      // 1. First, check if the team_id exists in the team table
      const matchdayCheck = await db.query('SELECT matchday_id FROM "Res_Matchday" WHERE matchday_id = $1', [matchday]);
            
      if (matchdayCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Matchday not found' });
      }
        
      const hometeamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [home_team]);
      
      if (hometeamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Home Team not found' });
      }

      const awayteamCheck = await db.query('SELECT team_id FROM "Team" WHERE team_id = $1', [away_team]);
      
      if (awayteamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Away Team not found' });
      }
  
      // 2. Check if the player exists in the player table
      const playerResult = await db.query('SELECT * FROM "Result_Matchday" WHERE result_id = $1', [result_id]);
      if (playerResult.rows.length === 0) {
        return res.status(404).json({ message: 'Result not found' });
      }
  
      // 3. Update the player details
      const updateQuery = `
        UPDATE "Result_Matchday"
        SET matchday = $2, home_team = $3, away_team = $4, home_team_score = $5, away_team_score = $6
        WHERE result_id = $1
        RETURNING *;
      `;
      const updatedFixture = await db.query(updateQuery, [
        result_id,
        matchday, 
        home_team, 
        away_team,
        home_team_score, 
        away_team_score
      ]);
  
      // 4. Respond with the updated player data
      res.json(updatedFixture.rows[0]);
    } catch (error) {
      // Error handling
      console.error('Error updating result:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
  
  export const deleteResult = async (req, res) => {
    const { result_id } = req.params;
  
    try {
      // Check if the player exists
      const fixtureResult = await db.query('SELECT * FROM "Result_Matchday" WHERE result_id = $1', [result_id]);
      if (fixtureResult.rows.length === 0) {
        return res.status(404).json({ message: 'Result not found' });
      }
  
      // Delete the player from the database
      const deleteResult = await db.query('DELETE FROM "Result_Matchday" WHERE result_id = $1 RETURNING *', [result_id]);
  
      // Check if the deletion was successful (returning deleted player)
      if (deleteResult.rows.length === 0) {
        return res.status(500).json({ message: 'Failed to delete result' });
      }
  
      // Respond with a success message
      res.json({ message: 'Result deleted successfully', Result: result_id });
    } catch (error) {
      // Error handling
      console.error('Error deleting fixture:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
  
