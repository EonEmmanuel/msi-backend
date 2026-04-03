import db from '../db.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const createuser = async (req, res, next) => {

    try {
        const { username, email, phone, password, role } = req.body;

            // Validate input
        if (!username || !email || !phone ||  !password) {
          return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await db.query('SELECT * FROM "User" WHERE username = $1', [username]);
          
          if (user.rows.length > 0) {
            return res.status(404).json({ message:'User Already Exist'});
          }
        
        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);
        
        const result = await db.query(
          'INSERT INTO "User" (username, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [username, email, phone, hashedPassword, role]
        );
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Query the database for the user
    const query = 'SELECT * FROM "User" WHERE email = $1';
    const result = await db.query(query, [email]);
    
    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const SecretKey = 'mtn_elite_key'
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
       SecretKey,
      { expiresIn: '1h' }
    );
    
    // Return success with token
    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export const getuser = async ( req, res) => {
  try {
    // 1. Query the database to get all users
    const result = await db.query(`
      SELECT user_id, username, email, phone, password, role
      FROM "User"
    `);

    // 2. Check if any users are found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No players found' });
    }

    res.json(result.rows);

    // 3. Respond with all users
  } catch (error) {
    // Error handling
    console.error('Error retrieving users:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const getuserid = async (req, res) => {

  const { user_id } = req.params;

  try {
    // 1. Query the database to get the player with team details
    const result = await db.query(`
      SELECT username, email, phone, role
      FROM "User"
      WHERE user_id = $1
    `, [user_id]);

    // 2. If no player is found, return a 404 response
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Respond with the player data along with the team details
    res.json(result.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error retrieving User:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const updateuser = async (req, res) => {

  const { user_id } = req.params;
  const { username, email, phone, role } = req.body;

  try {

    // 2. Check if the player exists in the player table
    const userResult = await db.query('SELECT * FROM "User" WHERE user_id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Update the player details
    const updateQuery = `
      UPDATE "User"
      SET username = $2, email = $3, phone = $4, role = $5
      WHERE user_id = $1
      RETURNING *;
    `;
    const updatedUser = await db.query(updateQuery, [
      user_id,
      username,
      email,
      phone,
      role
    ]);

    // 4. Respond with the updated player data
    res.json(updatedUser.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error updating player:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const forgotpassword = async (req, res) => {
  
  const { email } = req.query;
  const { password, c_password } = req.body;

  try {
    if (!email || !password || !c_password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (password !== c_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    // Check if user exists
    const userResult = await db.query(
      'SELECT email FROM "User" WHERE email = $1',
      [email]
    );

    // IMPORTANT: generic response (security)
    if (userResult.rows.length === 0) {
      return res.json({
        message: "User not Found",
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Update password
    await db.query(
      `
      UPDATE "User"
      SET password = $2
      WHERE email = $1
      `,
      [email, hashedPassword]
    );

    res.status(200).json('Reset Completed');
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteuser = async (req, res) => {

  const { user_id } = req.params;

  try {
    // Check if the player exists
    const userResult = await db.query('SELECT * FROM "User" WHERE user_id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'user not found' });
    }

    // Delete the player from the database
    const deleteResult = await db.query('DELETE FROM "User" WHERE user_id = $1 RETURNING *', [user_id]);

    // Check if the deletion was successful (returning deleted player)
    if (deleteResult.rows.length === 0) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }

    // Respond with a success message
    res.json({ message: 'user deleted successfully', user_id: user_id });
  } catch (error) {
    // Error handling
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: error.message });
  }
}


export const profile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT user_id, username, email, phone, created_at FROM "User" WHERE user_id = $1',
      [req.user.user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
