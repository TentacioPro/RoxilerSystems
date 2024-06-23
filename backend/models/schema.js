import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const productTransactionSchema = new Schema ({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: Date
});

const ProductTransaction = mongoose.model('ProductTransaction', productTransactionSchema);

export {ProductTransaction};