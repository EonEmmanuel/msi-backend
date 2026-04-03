import db from '../db.js';  // Assuming you are using a db module for your PostgreSQL queries

export const createSchedule = async (req, res) => {

  try {
    const { day, program } = req.body;

    // Insert the new player into the Player table
    const result = await db.query(
      'INSERT INTO "Schedule" (day, program) VALUES ($1, $2) RETURNING *',
      [day, program]
    );
    
    const newSchedule = result.rows[0];  // Assuming `result.rows` contains the inserted player

    res.status(201).json(newSchedule);  // Respond with the newly created player
  } catch (error) {
    console.error(error)
  }
};

export const getSchedule = async (req, res) => {
  
  const { schedule_id } = req.params;

  try {
    // 1. Query the database to get the player with team details
    const result = await db.query(`
     SELECT s.schedule_id, s.day, s.program, p.image, p.name, p.p_image, p."desc", p.time, p.occurence, p.duration, p.tag, p.live, p."unique", p.themecolor
      FROM "Schedule" s
      LEFT JOIN "Program" p ON s.program = p.program_id
      WHERE schedule_id = $1
    `, [schedule_id]);

    // 2. If no player is found, return a 404 response
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // 3. Respond with the player data along with the team details
    res.json(result.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error retrieving schedule:', error.message);
    res.status(500).json({ error: error.message });
  }
}


export const getAllSchedule = async (req, res) => {
  try {
    // 1. Query the database to get all players along with their team details
    const result = await db.query(`
     SELECT s.schedule_id, s.day, s.program, p.image, p.name, p.p_image, p."desc", p.time, p.occurence, p.duration, p.tag, p.live, p."unique", p.themecolor
      FROM "Schedule" s
      LEFT JOIN "Program" p ON s.program = p.program_id
     ORDER BY schedule_id DESC
    `);

    const sum = await db.query('SELECT COUNT(*) FROM "Schedule"');
    const total = sum.rows[0].count;

    // 2. Check if any players are found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No Schedule found' });
    }

    const data = result.rows

    // 3. Respond with all players along with their team details
    res.json({data, total});
  } catch (error) {
    // Error handling
    console.error('Error retrieving schedule:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const getScheduleByDay = async (req, res) => {
  const { day } = req.query;

  console.log('Received day:', day); // check what's coming in

  try {
    const result = await db.query(`
     SELECT s.schedule_id, s.day, s.program, p.image, p.name, p.p_image, p."desc", p.time, p.occurence, p.duration, p.tag, p.live, p."unique", p.themecolor
      FROM "Schedule" s
      LEFT JOIN "Program" p ON s.program = p.program_id
      WHERE LOWER(s.day) = LOWER($1)
      ORDER BY s.schedule_id DESC
    `, [day]);

    const total = result.rows.length;

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No Schedule found' });
    }

    res.json({ data: result.rows, total });
  } catch (error) {
    console.error('Error retrieving schedule:', error.message);
    res.status(500).json({ error: error.message });
  }
}


export const updateSchedule = async (req, res) => {

  const { schedule_id } = req.params;

  const { day, program } = req.body;

  try {

    // 2. Check if the player exists in the player table
    const playerResult = await db.query('SELECT * FROM "Schedule" WHERE schedule_id = $1', [schedule_id]);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // 3. Update the player details
    const updateQuery = `
      UPDATE "Schedule"
        SET day = $2, program = $3
        WHERE schedule_id = $1
      RETURNING *;
    `;
    const updatedSchedule = await db.query(updateQuery, [
      schedule_id,
      day, 
      program
    ]);

    // 4. Respond with the updated player data
    res.json(updatedSchedule.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error updating schedule:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const deleteSchedule = async (req, res) => {

  const { schedule_id } = req.params;

  try {
    // Check if the player exists
    const playerResult = await db.query('SELECT * FROM "Schedule" WHERE schedule_id = $1', [schedule_id]);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Delete the player from the database
    const deleteResult = await db.query('DELETE FROM "Schedule" WHERE schedule_id = $1 RETURNING *', [schedule_id]);

    // Check if the deletion was successful (returning deleted player)
    if (deleteResult.rows.length === 0) {
      return res.status(500).json({ message: 'Failed to delete schedule' });
    }

    // Respond with a success message
    res.json({ message: 'Schedule deleted successfully', schedule_id: schedule_id });
  } catch (error) {
    // Error handling
    console.error('Error deleting schedule:', error.message);
    res.status(500).json({ error: error.message });
  }
}
