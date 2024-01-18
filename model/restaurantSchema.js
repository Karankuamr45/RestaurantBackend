import mongoose from "mongoose";
import { itemSchema } from "./itemSchema.js";

const restaurantSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    items: [itemSchema],

})

const restaurantModel=mongoose.model("Restaurant",restaurantSchema);

export default restaurantModel;