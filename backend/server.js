import express from 'express';
import dotenv from 'dotenv';    
import { sql } from './config/db.js';
import { rateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json()); 
app.use(rateLimiter); 

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

// route for getting the transactions of a user

app.get("/api/transactions/:userId" , async(req, res)=>{
  try {
    const {userId} = req.params;

    const transaction = await sql`
    SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC;
    `;

    res.status(200).json(transaction);
  } catch (error) {
        console.log("Error getting the transaction" , error); 
        res.status(500).json({Message: "Internal Server Error" , status: "failed"});  
  }
});

// route to create a new transaction
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

        res.status(201).json(transaction[0]);

    } catch (error) {
        console.log("Error creating the transaction" , error); 
        res.status(500).json({Message: "Internal Server Error" , status: "failed"});    
        }
});


// route for delting  a transaction
app.delete("/api/transactions/:id" , async (req, res)=>{
    try {
        const {id} = req.params;

        if(isNaN(parseInt(id))){
            return res.status(400).json({Message: "Invalid transaction id" , status: "failed"});
        }

        const transaction = await sql`
        delete from transactions where id = ${id} returning *
        `;

        if(transaction.length === 0){
            return res.status(404).json({Message: "Transaction not found" , status: "failed"});
        }
        res.status(200).json({Message: "Transaction deleted successfully" , status: "success"});
    } catch (error) {
        console.log("Error deleting the transaction" , error); 
        res.status(500).json({Message: "Internal Server Error" , status: "failed"}); 
    }
});

// route to get the total amount , income and expense of a user
app.get("/api/transactions/summary/:userId" , async(req , res)=>{
  try {
    const {userId}  = req.params;

    const balanceResult = await sql `
        SELECT COALESCE(SUM(amount) , 0) as balance FROM transactions where user_id = ${userId};
    `;

    const incomeResult = await sql `
        SELECT COALESCE(SUM(amount) , 0) as income FROM transactions where user_id = ${userId} AND amount > 0
    `

    const expenseResult = await sql `
        SELECT COALESCE(SUM(amount) , 0) as expenses FROM transactions where user_id = ${userId} AND amount < 0
    `

    res.status(200).json({
        balance : balanceResult[0].balance, 
        income : incomeResult[0].income,
        expenses : expenseResult[0].expenses
    });

  } catch (error) {
        console.log("Error getting the summary " , error); 
        res.status(500).json({Message: "Internal Server Error" , status: "failed"}); 
  }
});

connectToDatabase().then(() =>{ 
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});