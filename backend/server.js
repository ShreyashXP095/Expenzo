import express from 'express';
import dotenv from 'dotenv';    
import { sql } from './config/db.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

async function connectToDatabase() {
    try {
        await sql `CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        used_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
        ) `;

        console.log('Connected to the database successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); //   1 means failure and 0 means success

    }
};

app.get('/', (req, res) => {
  res.send('Expense Tracker Backend is running');
});


connectToDatabase().then(() =>{ 
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});