const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "contact_db",
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        process.exit(1);
    }
    console.log("Connected to database.");
});

app.post("/add", (req, res) => {
    const { last_name, first_name, email_address, contact_number } = req.body;

    if (!last_name || !first_name || !email_address || !contact_number) {
        return res.status(400).send("All fields are required.");
    }

    const query = `
        INSERT INTO contact_list (last_name, first_name, email_address, contact_number, is_deleted)
        VALUES (?, ?, ?, ?, 0)
    `;
    db.query(query, [last_name, first_name, email_address, contact_number], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error");
        }
        res.send("Contact added");
    });
});

app.put("/update/:id", (req, res) => {
    const { id } = req.params;
    const { last_name, first_name, email_address, contact_number } = req.body;

    if (!last_name || !first_name || !email_address || !contact_number) {
        return res.status(400).send("All fields are required.");
    }

    const query = `
        UPDATE contact_list
        SET last_name = ?, first_name = ?, email_address = ?, contact_number = ?
        WHERE id = ? AND is_deleted = 0
    `;
    db.query(query, [last_name, first_name, email_address, contact_number, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error");
        }
        if (result.affectedRows === 0) {
            return res.status(404).send("Contact not found or already deleted.");
        }
        res.send("Contact updated");
    });
});

app.get("/contacts", (req, res) => {
    const query = `SELECT * FROM contact_list WHERE is_deleted = 0`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error");
        }
        res.json(results);
    });
});

app.delete("/delete/:id", (req, res) => {
    const { id } = req.params;

    const query = `
        UPDATE contact_list
        SET is_deleted = 1
        WHERE id = ? AND is_deleted = 0
    `;
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error");
        }
        if (result.affectedRows === 0) {
            return res.status(404).send("Contact not found.");
        }
        res.send("Contact deleted");
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});