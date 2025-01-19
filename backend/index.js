import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2";
import serveStatic from "serve-static";

const STATIC_PATH =
    process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

dotenv.config();
const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get("/api/active", (req, res) => {
  const query = "SELECT * FROM active_challenges";

  db.query(query, (err, results) => {
      if (err) {
        console.log("challenges data", err);
          return res.status(500).json({ success: false, message: "An error occurred." });
      }
      if (results.length === 0) {
          return res.status(404).json({ success: false, message: "No member found." });
      }
      res.status(200).json({success: true, data: results});
  });
});

app.get("/api/failed", (req, res) => {
  const query = "SELECT * FROM failed_challenges";

  db.query(query, (err, results) => {
      if (err) {
        console.log("challenges data", err);
          return res.status(500).json({ success: false, message: "An error occurred." });
      }
      if (results.length === 0) {
          return res.status(404).json({ success: false, message: "No member found." });
      }
      res.status(200).json({success: true, data: results});
  });
});

app.get("/api/completed", (req, res) => {
  const query = "SELECT * FROM completed_challenges";

  db.query(query, (err, results) => {
      if (err) {
        console.log("challenges data", err);
          return res.status(500).json({ success: false, message: "An error occurred." });
      }
      if (results.length === 0) {
          return res.status(404).json({ success: false, message: "No member found." });
      }
      res.status(200).json({success: true, data: results});
  });
});

app.post('/api/active', (req, res) => {
  const { title, description, deadline, image } = req.body;

  if (!title || !description || !deadline || !image) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = `INSERT INTO active_challenges (title, description, deadline, image) VALUES (?, ?, ?, ?)`;
  db.query(query, [title, description, deadline, JSON.stringify(image)], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({ message: 'Challenge added successfully', id: result.insertId });
  });
});

app.post('/api/move', (req, res) => {
  const { id, fromTable, toTable } = req.body;

  if (!id || !fromTable || !toTable) {
    return res.status(400).json({ success: false, message: 'ID, source table, and target table are required' });
  }

  const selectQuery = `SELECT * FROM ${mysql.escapeId(fromTable)} WHERE id = ?`;
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error('Error fetching challenge:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Challenge not found in the source table' });
    }

    const challenge = results[0];

    const insertQuery = `
      INSERT INTO ${mysql.escapeId(toTable)} (id, title, description, deadline, image)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      insertQuery,
      [challenge.id, challenge.title, challenge.description, challenge.deadline, JSON.stringify(challenge.image)],
      (insertErr) => {
        if (insertErr) {
          console.error('Error inserting challenge into target table:', insertErr);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Delete the challenge from the source table
        const deleteQuery = `DELETE FROM ${mysql.escapeId(fromTable)} WHERE id = ?`;
        db.query(deleteQuery, [id], (deleteErr) => {
          if (deleteErr) {
            console.error('Error deleting challenge from source table:', deleteErr);
            return res.status(500).json({ success: false, message: 'Database error' });
          }

          res.status(200).json({
            success: true,
            message: `Challenge moved from ${fromTable} to ${toTable} successfully`,
          });
        });
      }
    );
  });
});

app.use((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  res.status(404).json({ message: 'Not found' });
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.listen(PORT, () => {
  console.log(`React app listening on port ${PORT}`);
});
