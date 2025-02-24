const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('875280380466-buokmdgppe12ri5cnojedvgdp9b05hj2.apps.googleusercontent.com'); // Replace with your actual Client ID
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

// Configure Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: process.env.EMAIL_USER, // Use environment variable for email
      pass: process.env.EMAIL_PASS, // Use environment variable for app-specific password
  },
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = file.fieldname === 'images' 
            ? 'uploads/properties'
            : 'uploads/documents';
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'images') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Only image files are allowed!'), false);
            }
        } else if (file.fieldname === 'validId' || file.fieldname === 'businessPermit') {
            if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
                return cb(new Error('Only images and PDF files are allowed!'), false);
            }
        }
        cb(null, true);
    }
}).fields([
    { name: 'validId', maxCount: 1 },
    { name: 'businessPermit', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

// Configure multer for profile image uploads
const profileImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profile-images';
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadProfileImage = multer({
    storage: profileImageStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('profileImage');

// Login Business Owner
exports.businessOwnerLogin = (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM business_owners WHERE email = ?';
  db.query(sql, [email], (err, results) => {
      if (err) {
          return res.status(500).json({ error: err });
      }

      if (results.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = results[0];

      // Directly compare plain text passwords
      if (user.password !== password) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token with 20 seconds expiry
      const token = jwt.sign(
          { id: user.id, email: user.email },
          'your_jwt_secret',
          { expiresIn: '1h' } // Token expires in 20 seconds
      );

      // Send all business owner details including profile_image
      res.status(200).json({
          message: 'Login successful',
          token,
          user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              business_name: user.business_name,
              business_address: user.business_address,
              business_type: user.business_type,
              registration_number: user.registration_number,
              created_at: user.created_at,
              profile_image: user.profile_image  // Added profile_image field
          }
      });
  });
};

exports.getRoomsWithBranch = (req, res) => {
  const ownerId = req.params.ownerId; // Extract ownerId from request params

  if (!ownerId) {
    return res.status(400).json({ error: "Owner ID is required" });
  }

  const sql = `
    SELECT rooms.*, branches.name AS branch_name
    FROM rooms
    INNER JOIN branches ON rooms.branch_id = branches.id
    WHERE branches.owner_id = ?`; // Fetch rooms only for the logged-in owner

  db.query(sql, [ownerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

exports.getBranches = (req, res) => {
  const ownerId = req.params.ownerId; // Extract ownerId from request params

  if (!ownerId) {
    return res.status(400).json({ error: "Owner ID is required" });
  }

  const sql = `
    SELECT * FROM branches
    WHERE owner_id = ?`; // Fetch branches only for the logged-in owner

  db.query(sql, [ownerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
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

// Controller function
exports.addBranch = (req, res) => {
  const { name, address, contact, hours, image, mapLink, owner_id } = req.body; // Get owner_id from request body

  if (!owner_id || !name || !address || !contact || !hours || !image || !mapLink) {
      return res.status(400).json({ error: "All fields, including owner_id, are required." });
  }

  const sql = `
      INSERT INTO branches (owner_id, name, address, contact, hours, image, mapLink)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `; // Insert owner_id along with other branch details

  db.query(sql, [owner_id, name, address, contact, hours, image, mapLink], (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Branch added successfully', branchId: results.insertId });
  });
};

// Controller function
exports.updateBranch = (req, res) => {
    const { id } = req.params; // Get the branch ID from the request parameters
    const { name, address, contact, hours, image, mapLink } = req.body; // Get updated data from the request body
    const sql = `
        UPDATE branches
        SET name = ?, address = ?, contact = ?, hours = ?, image = ?, mapLink = ?
        WHERE id = ?
    `; // SQL query to update branch details

    db.query(sql, [name, address, contact, hours, image, mapLink, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Branch not found' });
        }
        res.status(200).json({ message: 'Branch updated successfully' });
    });
};

// Controller function
exports.deleteBranch = (req, res) => {
    const { id } = req.params; // Get the branch ID from the request parameters
    const sql = `DELETE FROM branches WHERE id = ?`; // SQL query to delete a branch

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Branch not found' });
        }
        res.status(200).json({ message: 'Branch deleted successfully' });
    });
};

exports.getBookings = (req, res) => {
  const userId = req.params.userId; // Ensure userId is extracted correctly

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const sql = `
    SELECT 
      id, 
      name AS tenant, 
      email,
      contact,
      CONCAT(branch_name, ' - Room ', room_number) AS property, 
      DATE_FORMAT(rent_date, '%Y-%m-%d %h:%i %p') AS date, 
      rent_duration,
      is_renting_alone,
      group_size,
      gender,
      status,
      owner_id
    FROM renters
    WHERE owner_id = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

  exports.deleteBooking = (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM renters WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    });
};
  
exports.updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `
    UPDATE renters 
    SET status = ? 
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Send email if the booking is confirmed
    if (status === 'Confirmed') {
      const sqlGetBookingAndOwner = `
        SELECT r.*, bo.email as owner_email, bo.email_pass, bo.business_name, bo.business_address
        FROM renters r
        JOIN business_owners bo ON r.owner_id = bo.id
        WHERE r.id = ?
      `;

      db.query(sqlGetBookingAndOwner, [id], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result && result.length > 0) {
          const bookingData = result[0];

          // Create a new transporter for this specific owner
          const ownerTransporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: bookingData.owner_email,
              pass: bookingData.email_pass
            }
          });

          const mailOptions = {
            from: bookingData.owner_email,
            to: bookingData.email,
            subject: `Booking Confirmed - ${bookingData.business_name}`,
            text: `
              Dear ${bookingData.name},

              We are pleased to inform you that your booking at ${bookingData.branch_name} has been confirmed.

              Booking Details:
              Room: ${bookingData.room_number}
              Booking Date: ${bookingData.rent_date}
              Group Size: ${bookingData.group_size}
              Gender: ${bookingData.gender}

              Business Information:
              ${bookingData.business_name}
              ${bookingData.business_address}

              If you are ready to move in, please visit our office from Monday to Saturday, between 9:00 AM and 5:00 PM, to complete the necessary arrangements.

              Thank you for choosing ${bookingData.business_name}!

              Best regards,
              ${bookingData.business_name} Management
            `,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Booking Confirmation</h2>
                <p>Dear ${bookingData.name},</p>
                
                <p>We are pleased to inform you that your booking at ${bookingData.branch_name} has been confirmed.</p>
                
                <h3>Booking Details:</h3>
                <ul>
                  <li>Room: ${bookingData.room_number}</li>
                  <li>Booking Date: ${bookingData.rent_date}</li>
                  <li>Group Size: ${bookingData.group_size}</li>
                  <li>Gender: ${bookingData.gender}</li>
                </ul>

                <h3>Business Information:</h3>
                <p>${bookingData.business_name}<br>
                ${bookingData.business_address}</p>

                <p>If you are ready to move in, please visit our office from Monday to Saturday, between 9:00 AM and 5:00 PM, to complete the necessary arrangements.</p>

                <p>Thank you for choosing ${bookingData.business_name}!</p>

                <p>Best regards,<br>
                ${bookingData.business_name} Management</p>
              </div>
            `
          };

          // Send the email using owner's transporter
          ownerTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }
      });
    }

    res.status(200).json({ message: 'Booking status updated successfully' });
  });
};
  // Add a New Room
  exports.addRoom = (req, res) => {
    const { branch_id, room_number, type, price_per_night, max_occupancy, owner_id } = req.body;
  
    if (!branch_id || !room_number || !type || !price_per_night || !max_occupancy || !owner_id) {
      return res.status(400).json({ message: 'All fields, including owner_id, are required.' });
    }
  
    const insertQuery = `
      INSERT INTO rooms (branch_id, owner_id, room_number, type, price_per_night, max_occupancy, total_renters)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `;
  
    db.query(insertQuery, [branch_id, owner_id, room_number, type, price_per_night, max_occupancy], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Room added successfully.' });
    });
  };  

// Edit Room Details
exports.editRoom = (req, res) => {
  const { id } = req.params;
  const { branch_id, room_number, type, price_per_night, max_occupancy } = req.body;

  const updateQuery = `
    UPDATE rooms 
    SET branch_id = ?, room_number = ?, type = ?, price_per_night = ?, max_occupancy = ? 
    WHERE id = ?
  `;

  db.query(updateQuery, [branch_id, room_number, type, price_per_night, max_occupancy, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: 'Room updated successfully.' });
  });
};

// Increment Renter Count
exports.incrementRenter = (req, res) => {
  const { id } = req.params;

  const getRoomQuery = `SELECT total_renters, max_occupancy FROM rooms WHERE id = ?`;

  db.query(getRoomQuery, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.length === 0) return res.status(404).json({ message: 'Room not found' });

    const { total_renters, max_occupancy } = result[0];

    if (total_renters < max_occupancy) {
      const updateQuery = `UPDATE rooms SET total_renters = total_renters + 1 WHERE id = ?`;
      db.query(updateQuery, [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        return res.status(200).json({ message: 'Renter count incremented' });
      });
    } else {
      return res.status(400).json({ message: 'Maximum occupancy reached' });
    }
  });
};

// Decrement Renter Count
exports.decrementRenter = (req, res) => {
  const { id } = req.params;

  const getRoomQuery = `SELECT total_renters FROM rooms WHERE id = ?`;

  db.query(getRoomQuery, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.length === 0) return res.status(404).json({ message: 'Room not found' });

    const { total_renters } = result[0];

    if (total_renters > 0) {
      const updateQuery = `UPDATE rooms SET total_renters = total_renters - 1 WHERE id = ?`;
      db.query(updateQuery, [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        return res.status(200).json({ message: 'Renter count decremented' });
      });
    } else {
      return res.status(400).json({ message: 'No renters to remove' });
    }
  });
};

exports.addTenant = (req, res) => {
  const { name, room, branch, email, phone, moveInDate, owner_id } = req.body;

  // Validate required fields
  if (!name || !room || !branch || !email || !phone || !moveInDate || !owner_id) {
    return res.status(400).json({ message: 'All fields, including owner_id, are required.' });
  }

  // Insert query to add tenant into the database
  const insertQuery = `
    INSERT INTO tenants (name, room, branch, email, phone, move_in_date, owner_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [name, room, branch, email, phone, moveInDate, owner_id], (err, result) => {
    if (err) {
      console.error('Error inserting tenant:', err);
      return res.status(500).json({ message: 'Database error.' });
    }
    res.status(201).json({ message: 'Tenant added successfully', tenantId: result.insertId });
  });
};

exports.updateTenant = (req, res) => {
  const { id } = req.params;
  const { name, room, branch, email, phone, moveInDate } = req.body;

  // Validate required fields
  if (!name || !room || !branch || !email || !phone || !moveInDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Update query to modify tenant details in the database
  const updateQuery = `
    UPDATE tenants
    SET name = ?, room = ?, branch = ?, email = ?, phone = ?, move_in_date = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [name, room, branch, email, phone, moveInDate, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.status(200).json({ message: 'Tenant updated successfully.' });
  });
};

exports.deleteTenant = (req, res) => {
  const { id } = req.params;

  // Delete query to remove tenant from the database
  const deleteQuery = 'DELETE FROM tenants WHERE id = ?';

  db.query(deleteQuery, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.status(200).json({ message: 'Tenant deleted successfully.' });
  });
};

exports.getTenants = (req, res) => {
  const ownerId = req.params.ownerId; // Extract ownerId from request params

  if (!ownerId) {
    return res.status(400).json({ error: "Owner ID is required" });
  }

  const sql = `
    SELECT * FROM tenants
    WHERE owner_id = ?`; // Fetch tenants only for the logged-in owner

  db.query(sql, [ownerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// Endpoint to get branches and rooms
exports.getBranchesAndRooms = (req, res) => {
  const ownerId = req.params.ownerId; // Extract ownerId from request params

  if (!ownerId) {
    return res.status(400).json({ error: "Owner ID is required" });
  }

  const query = `
    SELECT b.id AS branch_id, b.name AS branch_name, r.id AS room_id, r.room_number, r.type
    FROM branches b
    LEFT JOIN rooms r ON b.id = r.branch_id
    WHERE b.owner_id = ?`; // Fetch only branches and rooms of the logged-in owner

  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    // Group rooms by branch name
    const branchesWithRooms = results.reduce((acc, row) => {
      const branchIndex = acc.findIndex(branch => branch.branch_name === row.branch_name);
      if (branchIndex === -1) {
        acc.push({
          branch_name: row.branch_name,
          rooms: row.room_id ? [{ room_id: row.room_id, room_number: row.room_number, type: row.type }] : []
        });
      } else if (row.room_id) {
        acc[branchIndex].rooms.push({
          room_id: row.room_id,
          room_number: row.room_number,
          type: row.type
        });
      }
      return acc;
    }, []);

    res.status(200).json(branchesWithRooms);
  });
};

exports.updateAmenities = (req, res) => {
    const { branch_id } = req.params;
    const {
        totalRooms,
        accommodationPerRoom,
        bathrooms,
        parkingLot,
        pricePerMonth,
        Wifi,
        airConditioning,
        swimmingPool,
        gym,
        garden,
        security,
        elevator
    } = req.body;

    const updateSql = `
        UPDATE amenities
        SET totalRooms = ?,
            accommodationPerRoom = ?,
            bathrooms = ?,
            parkingLot = ?,
            pricePerMonth = ?,
            Wifi = ?,
            airConditioning = ?,
            swimmingPool = ?,
            gym = ?,
            garden = ?,
            security = ?,
            elevator = ?
        WHERE branch_id = ?
    `;

    db.query(updateSql, [
        totalRooms,
        accommodationPerRoom,
        bathrooms,
        parkingLot,
        pricePerMonth,
        Wifi,
        airConditioning,
        swimmingPool,
        gym,
        garden,
        security,
        elevator,
        branch_id
    ], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Amenities not found for this branch' });
        }

        // Fetch updated data
        const fetchSql = `
            SELECT branches.*, amenities.*
            FROM branches
            LEFT JOIN amenities ON branches.id = amenities.branch_id
            WHERE branches.id = ?
        `;

        db.query(fetchSql, [branch_id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Branch not found' });
            }
            res.status(200).json(results[0]);  // Return the updated branch data
        });
    });
};

exports.listProperty = (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Parse amenities safely
      let amenitiesArray = [];
      try {
        if (req.body.amenities) {
          amenitiesArray = JSON.parse(req.body.amenities);
          if (!Array.isArray(amenitiesArray)) {
            throw new Error('Amenities must be an array');
          }
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid amenities format' });
      }

      const {
        ownerName, ownerEmail, ownerPhone, businessName, businessType,
        ownerAddress, preferredContact, availableTime, propertyType,
        bedrooms, bathrooms, price, address, city, region, province,
        zipCode, description
      } = req.body;

      if (!ownerName || !ownerEmail || !ownerPhone || !propertyType || !address) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      db.beginTransaction((err) => {
        if (err) {
          console.error("Transaction Error:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Insert owner information
        db.query(
          `INSERT INTO business_property_owners 
          (name, email, phone, business_name, business_type, address, 
          valid_id_path, business_permit_path, preferred_contact, available_time)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ownerName, ownerEmail, ownerPhone, businessName || null, businessType,
            ownerAddress, req.files.validId ? req.files.validId[0].path : null,
            req.files.businessPermit ? req.files.businessPermit[0].path : null,
            preferredContact, availableTime
          ],
          (err, ownerResult) => {
            if (err) {
              return db.rollback(() => res.status(500).json({ error: err.message }));
            }

            const ownerId = ownerResult.insertId;

            // Insert property information
            db.query(
              `INSERT INTO rental_property_listings 
              (owner_id, property_type, bedrooms, bathrooms, price, 
              address, city, region, province, zip_code, description)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                ownerId, propertyType, bedrooms, bathrooms, price,
                address, city, region, province, zipCode, description
              ],
              (err, propertyResult) => {
                if (err) {
                  return db.rollback(() => res.status(500).json({ error: err.message }));
                }

                const propertyId = propertyResult.insertId;

                // Handle amenities with the parsed array
                if (amenitiesArray.length > 0) {
                  const amenitiesValues = amenitiesArray.map(amenity => [propertyId, amenity]);
                  db.query(
                    `INSERT INTO rental_property_amenities (property_id, amenity_name) VALUES ?`,
                    [amenitiesValues],
                    (err) => {
                      if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                      }
                    }
                  );
                }

                // Handle property images
                if (req.files.images) {
                  const imagesValues = req.files.images.map(file => [propertyId, file.path]);
                  db.query(
                    `INSERT INTO rental_property_images (property_id, image_path) VALUES ?`,
                    [imagesValues],
                    (err) => {
                      if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                      }
                    }
                  );
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => res.status(500).json({ error: err.message }));
                  }

                  // Configure email content
                  const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: ownerEmail,
                    subject: 'Property Listing Confirmation',
                    text: `
Dear ${ownerName},

Thank you for listing your property with us. Your property has been successfully listed. Here are the details:

Property Information:
- Type: ${propertyType}
- Location: ${address}, ${city}, ${province}
- Price: ₱${price} per month
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}

Business Information:
- Business Type: ${businessType}
- Business Name: ${businessName || 'N/A'}
- Contact Preference: ${preferredContact}
- Available Time: ${availableTime}

Your listing will be reviewed and made available to potential renters. We will notify you when interested renters contact you through our platform.

If you need to make any changes to your listing or have questions, please don't hesitate to contact us.

Best regards,
BedSpacio Team
`,
                  };

                  // Send the confirmation email
                  transporter.sendMail(mailOptions, (emailErr, info) => {
                    if (emailErr) {
                      console.error('Email error:', emailErr);
                      // Still return success but log the email failure
                      return res.status(201).json({
                        message: 'Property listed successfully, but confirmation email could not be sent',
                        ownerId,
                        propertyId
                      });
                    }
                    
                    res.status(201).json({
                      message: 'Property listed successfully and confirmation email sent',
                      ownerId,
                      propertyId
                    });
                  });
                });
              }
            );
          }
        );
      });
    });
  } catch (error) {
    console.error('Error in listProperty:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateEmailCredentials = async (req, res) => {
  const { id } = req.params;
  const { email, email_pass } = req.body;

  const sql = `
    UPDATE business_owners 
    SET email = ?, email_pass = ?
    WHERE id = ?
  `;

  db.query(sql, [email, email_pass, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Business owner not found' });
    }

    // Return updated user data (excluding sensitive information)
    const sqlGetUser = 'SELECT id, name, email, phone, business_name, business_address, business_type FROM business_owners WHERE id = ?';
    db.query(sqlGetUser, [id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ 
        message: 'Email credentials updated successfully',
        user: user[0]
      });
    });
  });
};

// Update Profile Settings
exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  const sql = `
    UPDATE business_owners 
    SET name = ?, phone = ?
    WHERE id = ?
  `;

  db.query(sql, [name, phone, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Business owner not found' });
    }

    // Return updated user data
    const sqlGetUser = 'SELECT id, name, email, phone, business_name, business_address, business_type FROM business_owners WHERE id = ?';
    db.query(sqlGetUser, [id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ 
        message: 'Profile updated successfully',
        user: user[0]
      });
    });
  });
};

// Update Business Information
exports.updateBusinessInfo = async (req, res) => {
  const { id } = req.params;
  const { business_name, business_address, business_type, registration_number } = req.body;

  const sql = `
    UPDATE business_owners 
    SET business_name = ?, 
        business_address = ?,
        business_type = ?,
        registration_number = ?
    WHERE id = ?
  `;

  db.query(sql, [business_name, business_address, business_type, registration_number, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Business owner not found' });
    }

    // Return updated user data
    const sqlGetUser = 'SELECT id, name, email, phone, business_name, business_address, business_type FROM business_owners WHERE id = ?';
    db.query(sqlGetUser, [id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ 
        message: 'Business information updated successfully',
        user: user[0]
      });
    });
  });
};

// Update Profile Image
exports.updateProfileImage = (req, res) => {
    uploadProfileImage(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: 'File upload error: ' + err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        const { id } = req.params;

        // If no file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Store only the relative path from the uploads directory
        const profileImagePath = req.file.path;

        const sql = `
            UPDATE business_owners 
            SET profile_image = ?
            WHERE id = ?
        `;

        db.query(sql, [profileImagePath, id], (err, result) => {
            if (err) {
                // Delete uploaded file if database update fails
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                });
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                // Delete uploaded file if no user found
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                });
                return res.status(404).json({ error: 'Business owner not found' });
            }

            // Return updated user data
            const sqlGetUser = 'SELECT id, name, email, phone, business_name, business_address, business_type, profile_image FROM business_owners WHERE id = ?';
            db.query(sqlGetUser, [id], (err, user) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(200).json({ 
                    message: 'Profile image updated successfully',
                    user: user[0]
                });
            });
        });
    });
};

// Add this new controller method
exports.deleteProfileImage = async (req, res) => {
    const { id } = req.params;

    try {
        // First get the current profile image path
        const sqlGetImage = 'SELECT profile_image FROM business_owners WHERE id = ?';
        db.query(sqlGetImage, [id], async (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'Business owner not found' });
            }

            const currentImagePath = result[0].profile_image;

            // Delete the file if it exists
            if (currentImagePath) {
                try {
                    await fsPromises.unlink(path.join(__dirname, '..', currentImagePath));
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                    // Continue even if file deletion fails
                }
            }

            // Update database to remove profile image reference
            const sqlUpdate = 'UPDATE business_owners SET profile_image = NULL WHERE id = ?';
            db.query(sqlUpdate, [id], (updateErr, updateResult) => {
                if (updateErr) {
                    return res.status(500).json({ error: updateErr.message });
                }

                // Return updated user data
                const sqlGetUser = 'SELECT id, name, email, phone, business_name, business_address, business_type, profile_image FROM business_owners WHERE id = ?';
                db.query(sqlGetUser, [id], (userErr, user) => {
                    if (userErr) {
                        return res.status(500).json({ error: userErr.message });
                    }
                    res.status(200).json({ 
                        message: 'Profile image deleted successfully',
                        user: user[0]
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};