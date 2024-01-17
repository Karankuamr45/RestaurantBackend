import mongoose from 'mongoose';

const itemSchema=mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    price:{
        type:Number
    },
    image:{
        type:String
    }
})
const itemModel=mongoose.model("Item",itemSchema);

export default itemModel;