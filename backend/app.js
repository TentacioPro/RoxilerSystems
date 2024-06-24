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

var port = process.env.PORT || 6000;

//Express Server
app.listen(6000, () => {
    console.log('Server running on port 6000');
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


//BarChart
app.get('/bar-chart', async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: { $month: month } };
    const priceRanges = [
      { $lte: 100 },
      { $gt: 100, $lte: 200 },
      { $gt: 200, $lte: 300 },
      { $gt: 300, $lte: 400 },
      { $gt: 400, $lte: 500 },
      { $gt: 500, $lte: 600 },
      { $gt: 600, $lte: 700 },
      { $gt: 700, $lte: 800 },
      { $gt: 800, $lte: 900 },
      { $gt: 900 }
    ];
    const data = await Promise.all(priceRanges.map(async (range, index) => {
      const count = await ProductTransaction.countDocuments({...query, price: range });
      return { label: `${index * 100} - ${index * 100 + 100}`, value: count };
    }));
    res.json(data);
  });


//PieChart
app.get('/pie-chart', async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: { $month: month } };
    const categories = await ProductTransaction.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json(categories);
  });


//Combined
app.get('/combined', async (req, res) => {
  const { month } = req.query;
  const transactions = await ProductTransaction.find({ dateOfSale: { $month: month } });
  const statistics = await statisticsAPI(month);
  const barChart = await barChartAPI(month);
  const pieChart = await pieChartAPI(month);
  res.json({ transactions, statistics, barChart, pieChart });
});

// //Display Statistics
// app.get('/stat', async (req,res) => {
//     const {month} = req.query;
//     try {
//         if(!month) {
//             return res.status(400).json({ error: 'Month parameter is required'});
//         }
//         const matchStage ={
//             $match: {
//                  $expr: { $eq: [{ $month:'$dateOfSale' }, parseInt(month)] }
//             }
//         };

//         const totalSaleAmountPipeline =[
//             matchStage,
//             {
//                 $group: {
//                     _id: null,
//                     totalSaleAmount: { $sum: '$price' }
//                 }
//             }
//         ];
//         const totalSaleAmountResult = await ProductTransaction.aggregate(totalSaleAmountPipeline);
//         const totalSoldItems = await ProductTransaction.countDocuments({ ...matchStage.$match, sold:true});
//         const totalNotSoldItems = await ProductTransaction.countDocuments({
//             ...matchStage.$match,price:0,sold: false

//         });
//         res.json({
//             totalSaleAmount: totalSaleAmountResult.length > 0 ? totalSaleAmountResult[0].totalSaleAmount : 0,
//             totalSoldItems,
//             totalNotSoldItems
//         });
//     } catch(err) {
//         console.error('Error fetching stat', err);
//         res.status(500).send('Error fetching stat');
//     }

// });

