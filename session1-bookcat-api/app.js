const express = require('express');
const sql = require('mssql');
const app = express();
app.use(express.json());
require('dotenv').config();

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustServerCertificate: true,
    },
}

app.get('/', (req, res) => {
res.send('Welcome to the Book Category API');
});

app.get('/categories', (req, res) => {
res.json([
{ id: 1, name: 'Fiction' },
{ id: 2, name: 'Non-Fiction' },
{ id: 3, name: 'Biography' }
]);
});

app.get('/about', (req, res) => {
res.send('Hello! I am Chan Wai Pok, a student of Ngee Ann Polytechnic.\
    I am currently pursuing a diploma in Information Technology.');
});

/* Session 2: Bookcat API Publisher Route */
// GET /publishers - Return Full List
app.get('/publishers', async (req, res) => {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const sqlQuery = 'SELECT * FROM Publisher';
        const request = connection.request();
        const result = await request.query(sqlQuery);
        res.json(result.recordset);
    }
    catch (err) {
        res.status(500).json({error: "Database Error"});
    }
    finally {
        if (connection) {
            try {
                await connection.close();
            }
            catch (closeErr) {
                console.error('Error closing database connection:', closeErr);
            }
        }
    }
});

// GET /publishers/:id - Return Publisher by ID
app.get('/publishers/:id', async (req, res) => {
    const publisherID = req.params.id;
    if (isNaN(publisherID)) {
        return res.status(400).json({ error: "Invalid Publisher ID" });
    }
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input('id', publisherID);
        const sqlQuery = 'SELECT PublisherID, Name \
                          FROM Publisher \
                          WHERE PublisherID = @id';
        const result = await request.query(sqlQuery);
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Publisher not found" });
        }
        res.status(200).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({error: "Database Error"});
    }
    finally {
        if (connection) {
            try {
                await connection.close();
            }
            catch (closeErr) {
                console.error('Error closing database connection:', closeErr);
            }
        }
    }
});

// POST /publishers - Add New Publisher
app.post('/publishers', async (req, res) => {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input('id', req.body.id);
        request.input('name', req.body.name);
        const sqlQuery = 'INSERT INTO Publisher (PublisherID, Name) \
                          OUTPUT INSERTED.* \
                          VALUES (@id, @name)';
        const result = await request.query(sqlQuery);
        res.status(201).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({error: "Database error"});
    }
    finally {
        if (connection) {
            try {
                await connection.close();
            }
            catch (closeErr) {
                console.error('Error closing database connection', closeErr);
            }
        }
    }
});

// PUT /publishers/:id - Update existing Publisher detail
app.put('/publishers/:id', async (req, res) => {
    const publisherID = parseInt(req.params.id);
    if (isNaN(publisherID)) {
        return res.status(400).json({error: "Invalid Publisher ID"});
    }
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input('id', publisherID);
        request.input('name', req.body.name);
        const sqlQuery = 'UPDATE Publisher \
                          SET Name = @name \
                          OUTPUT INSERTED.* \
                          WHERE PublisherID = @id';
        const result = await request.query(sqlQuery);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({error: "Publisher not found"});
        }
        res.status(200).json({updated: true, publisher: result.recordset[0]});
    }
    catch (err) {
        res.status(500).json({ error: "Database error"});
    }
    finally {
        if (connection) {
            try {
                await connection.close();
            }
            catch (closeErr) {
                console.error('Error closing database connection', closeErr);
            }
        }
    }
});

// DELETE /publishers/:id
app.delete('/publishers/:id', async (req, res) => {
    const publisherID = parseInt(req.params.id);
    if (isNaN(publisherID)) {
        res.status(400).json({error: "Invalid publisher ID"});
    }
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input('id', publisherID);
        const sqlQuery = 'DELETE FROM Publisher \
                          WHERE PublisherID = @id';
        const result = await request.query(sqlQuery);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({error: "Publisher not found"});
        }
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({error: "Database error"});
    }
    finally {
        if (connection) {
            try {
                await connection.close();
            }
            catch (closeErr) {
                console.error('Error closing database connection', closeErr);
            }
        }
    }
});

app.listen(3000, () => {
console.log('Listening on port 3000');
});

