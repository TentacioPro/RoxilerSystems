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

productTransactionSchema.index({ dateOfSale: 1});
const ProductTransaction = mongoose.model('ProductTransaction', productTransactionSchema);

export {ProductTransaction};