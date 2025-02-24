const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('875280380466-buokmdgppe12ri5cnojedvgdp9b05hj2.apps.googleusercontent.com'); // Replace with your actual Client ID

// Configure Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: process.env.EMAIL_USER, // Use environment variable for email
      pass: process.env.EMAIL_PASS, // Use environment variable for app-specific password
  },
});

exports.googleSignIn = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '875280380466-buokmdgppe12ri5cnojedvgdp9b05hj2.apps.googleusercontent.com', // Replace with your actual Client ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, exp } = payload; // Including the expiration time (exp)

    // Check if the token has expired (current timestamp > expiration time)
    const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
    if (exp < currentTime) {
      // Token has expired
      return res.status(401).json({ error: 'Google token has expired. Please sign in again.' });
    }

    // Check if the user exists in the database
    db.query('SELECT * FROM users WHERE google_id = ?', [googleId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        // User doesn't exist, insert them into the database
        db.query(
          'INSERT INTO users (google_id, name, email, picture) VALUES (?, ?, ?, ?)',
          [googleId, name, email, picture],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const token = jwt.sign({ googleId, email }, 'your_jwt_secret', { expiresIn: '1h' });
            return res.status(200).json({ token, user: { googleId, name, email, picture } });
          }
        );
      } else {
        // User exists, generate a JWT
        const token = jwt.sign({ googleId, email }, 'your_jwt_secret', { expiresIn: '1h' });
        return res.status(200).json({ token, user: results[0] });
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid Google token or token verification failed' });
  }
};      

exports.getBranches = (req, res) => {
    const sql = 'SELECT * FROM branches';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.status(200).json(results);
    });
};

exports.getBranch = (req, res) => {
  const { id } = req.params;  // Get the branch ID from the request parameters
  const sql = `
      SELECT branches.*, amenities.*
      FROM branches
      LEFT JOIN amenities ON branches.id = amenities.branch_id
      WHERE branches.id = ?
  `;  // SQL query to fetch branch and its amenities by ID

  db.query(sql, [id], (err, results) => {  // Use parameterized queries to avoid SQL injection
      if (err) {
          return res.status(500).json({ error: err });
      }
      if (results.length === 0) {
          return res.status(404).json({ error: 'Branch not found' });
      }
      res.status(200).json(results[0]);  // Return the first matching branch and amenities
  });
};

exports.getRooms = (req, res) => {
  const { id } = req.params; // Get branch ID
  const sql = `
    SELECT id, room_number, description, type, price_per_night, max_occupancy, total_renters, image, owner_id
    FROM rooms 
    WHERE branch_id = ?
  `; // Query to get rooms for the branch including owner_id

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.status(200).json(results);
  });
};

exports.saveRenter = (req, res) => {
  const { name, email, contact, duration, room_id, branch_id, branch_name, room_number, is_renting_alone, group_size, gender, owner_id } = req.body;

  // Ensure all necessary fields are provided, including gender and owner_id
  if (!name || !email || !duration || !room_id || !branch_id || !branch_name || !room_number || !gender || !owner_id) {
      return res.status(400).json({ error: 'All fields are required, including owner_id' });
  }
  
  if (!is_renting_alone && (!group_size || group_size <= 0)) {
      return res.status(400).json({ error: 'Please specify the group size if you are not renting alone.' });
  }
  
  const sql = `
      INSERT INTO renters (name, email, contact, rent_duration, room_id, branch_id, branch_name, room_number, is_renting_alone, group_size, gender, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [name, email, contact, duration, room_id, branch_id, branch_name, room_number, is_renting_alone, is_renting_alone ? null : group_size, gender, owner_id], (err, results) => {
    if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err });
    }
  
      // Configure Nodemailer transporter using environment variables
      const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: process.env.EMAIL_USER, // Use environment variable for email
              pass: process.env.EMAIL_PASS, // Use environment variable for app-specific password
          },
      });

      // Email content
      const mailOptions = {
          from: process.env.EMAIL_USER, // Sender address
          to: email, // Recipient address
          subject: 'Room Rental Confirmation',
          text: `
Dear ${name},

Thank you for renting a room with us. Here are your rental details:

- Branch Name: ${branch_name}
- Room Number: ${room_number}
- Rent Duration: ${duration} month(s)

If you have any questions or concerns, feel free to contact us.

Best regards,
BedSpacio
`,
      };

      // Send the email
      transporter.sendMail(mailOptions, (emailErr, info) => {
          if (emailErr) {
              console.error('Email error:', emailErr);
              return res.status(500).json({ error: 'Renter saved, but email could not be sent' });
          }
          res.status(200).json({ message: 'Renter details saved and email sent successfully' });
      });
  });
};

exports.getReviews = (req, res) => {
  const { propertyId } = req.params;

  const selectQuery = 'SELECT * FROM reviews WHERE property_id = ? ORDER BY date DESC';

  db.query(selectQuery, [propertyId], (err, reviews) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.status(200).json(reviews);
  });
};

exports.addReview = (req, res) => {
  const { property_id, name, rating, comment, response } = req.body;

  // Ensure property_id corresponds to an existing branch id
  const selectQuery = 'SELECT * FROM branches WHERE id = ?';
  db.query(selectQuery, [property_id], (err, branch) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    }

    if (!branch.length) {
      return res.status(400).json({ error: 'Invalid property_id, branch not found' });
    }

    // Proceed with inserting the review if property_id is valid
    const insertQuery = `
      INSERT INTO reviews (property_id, name, rating, comment, response, date)
      VALUES (?, ?, ?, ?, ?, ?)`;

    const date = new Date().toISOString().split('T')[0];

    db.query(insertQuery, [property_id, name, rating, comment, response || null, date], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err });
      }

      res.status(200).json({ message: 'Review added successfully', reviewId: result.insertId });
    });
  });
};
