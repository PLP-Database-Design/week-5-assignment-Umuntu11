const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

// Connect to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the MySQL db:", err);
        return;
    }
    console.log("Connected to MySQL successfully as id:", db.threadId);
});

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Retrieve all patients
app.get('/patients', (req, res) => {
    db.query('SELECT * FROM patients', (err, results) => {
        if (err) {
            console.error("Error retrieving patient data:", err);
            res.status(500).send('Error retrieving patient data');
        } else {
            res.render('data', { patients: results, providers: [], filter: 'patients' });
        }
    });
});

// Retrieve all providers
app.get('/providers', (req, res) => {
    const query = 'SELECT first_name, last_name, provider_specialty FROM providers';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.render('data', { provider: results });
    });
});

// Filter patients by first name
app.get('/patients', (req, res) => {
    const query = 'SELECT first_name FROM patients';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.render('data', { patient: results });
    });
});


// Retrieve providers by specialty
app.get('/providers/filter', (req, res) => {
    const specialty = req.query.specialty;
    db.query('SELECT * FROM providers WHERE specialty = ?', [specialty], (err, results) => {
        if (err) {
            console.error("Error retrieving provider data:", err);
            res.status(500).send('Error retrieving provider data');
        } else {
            res.render('data', { patients: [], providers: results, filter: 'providers' });
        }
    });
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
    console.log('Sending message to browser...');
});
