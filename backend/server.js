import express from 'express';
import dotenv from 'dotenv';    
import { sql } from './config/db.js';

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());  

const PORT = process.env.PORT || 5001;

async function connectToDatabase() {
    try {
        await sql `CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
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
app.get('/root' ,( req , res) => {
    res.send("konsiapi is working");
});

app.post("/api/transactions" , async(req , res) => {
    try {
        const {title , amount , category , user_id} = req.body;
        
        if(!title || !category || !user_id || amount === undefined){
            return res.status(400).json({Message: "All Fields are required " , status: "failed"});
        }

        const transaction = await sql`
        INSERT INTO transactions (user_id , amount ,title , category)
        VALUES (${user_id} , ${amount} , ${title} , ${category})
        RETURNING *
        `;

        console.log(transaction);
        res.status(201).json(transaction[0]);

    } catch (error) {
        console.log("Error creating the transaction" , error); 
        res.status(500).json({Message: "Internal Server Error" , status: "failed"});    
        }
});


connectToDatabase().then(() =>{ 
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});