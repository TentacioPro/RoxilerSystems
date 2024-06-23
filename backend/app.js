//Initialization
import express from 'express';
import mongoose, { trusted } from 'mongoose';
import fetch from 'node-fetch';

import { ProductTransaction } from './models/schema.js';

const app = express();
app.use(express.json());

// //Middleware for Date Conversion
// const convertDateOfSaleMiddleWare = async(res,req,next) => {
//     try{
//         const documents = await ProductTransaction.find({});

//         for(let doc of documents) {
//             if (typeof doc.dateOfSale === 'string'){
//                 await ProductTransaction.updateOne(
//                     {_id: doc.id},
//                     { $set: { dateOfSale: new Date(doc,dateOfSale)}}
//                 );
//             }
//         }
//         console.log('Date Conversion completed');
//         next();
//     } catch (err) {
//         console.error('Error Converting dates:',err);
//         res.status(500).send('Error Converting dates');
//     };
// };


//Express Server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});


//Mongoose Connection
mongoose.connect('mongodb://127.0.0.1:27017/', {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(() => console.error('Could not connect to MongoDB',err))


//Initializing DB and Connecntion Check 
app.get('/initialize-db',async (req,res)=> {
    try {
        const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = await response.json();
        
        //Convert dateOfSale strings to Date Objects
        const convertedDate = data.map(item => ({
            ...item,
            dateOfSale: new Date(item.dateOfSale)
        }))

        await mongoose.connection.collection('producttransactions').deleteMany({});
        await mongoose.connection.collection('producttransactions').insertMany(data);
        res.send('Database initialized successfully!');
    } catch(err) {
        console.error('Error initializing the database',err);
        res.status(500).send('Error initializing the database');
    }
});


//List Transactions with Search 
app.get('/transactionslist', async(req,res) => {
    const{ month, search, page=1, perPage=10}= req.query;
    try {
        const match = {};
        if(month) {
            match.dateOfSale = { $expr: { $eq: [{ $month: "$dateOfSale"}, parseInt(month)]}};
        }
        const query = {};    
        if (search) {
        query.$or =[
            {title : {$regex: search, $options: 'i'}},
            {description: {$regex: search, $options: 'i'}},
            {price: {$regex: search, $options: 'i'}}
        ];
    }
    const transactions = await ProductTransaction.find(query)
        .skip((page-1)* perPage)
        .limit(perPage);
     res.json(transactions);
    } catch (err) {
        console.error('Error fetching Transactions', err);
        res.status(500).send('Error fetching transactions');
    }
});


//Display Statistics
app.get('/stat', async (req,res) => {
    const {month} = req.query;
    try {
        if(!month) {
            return res.status(400).json({ error: 'Month parameter is required'});
        }
        const matchStage ={
            $match: {
                 $expr: { $eq: [{ $month:'$dateOfSale' }, parseInt(month)] }
            }
        };

        const totalSaleAmountPipeline =[
            matchStage,
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: '$price' }
                }
            }
        ];
        const totalSaleAmountResult = await ProductTransaction.aggregate(totalSaleAmountPipeline);
        const totalSoldItems = await ProductTransaction.countDocuments({ ...matchStage.$match, sold:true});
        const totalNotSoldItems = await ProductTransaction.countDocuments({
            ...matchStage.$match,price:0,sold: false

        });
        res.json({
            totalSaleAmount: totalSaleAmountResult.length > 0 ? totalSaleAmountResult[0].totalSaleAmount : 0,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch(err) {
        console.error('Error fetching stat', err);
        res.status(500).send('Error fetching stat');
    }

});