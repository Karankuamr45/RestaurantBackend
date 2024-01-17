import itemModel from "../model/itemSchema.js";
import restaurantModel from "../model/restaurantSchema.js"
import cloudinary from 'cloudinary';

const homeController=(req,res)=>{
    res.send("doing code with cloudinary")
}

// Api to add a restaurant
const addRestaurantController=async(req,res)=>{
  try {
    const   {categories} =req.body
    

     // Ensure that req.file exists and is an image file
     if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }
    const result=await cloudinary.v2.uploader.upload(req?.file?.path)

    const newRestaurant= await restaurantModel({
        name:req.body.name,
        categories:categories?.map((category) => ({
          name: category.name,
          items: [], // You may need to handle items separately based on your requirements
        })),
        description:req.body.description,
        rating:req.body.rating,
        image:result.secure_url,
    })

    await newRestaurant.save();

    res.status(201).json({message : "Restaurant added successfully",newRestaurant})
    
  } catch (error) {
    console.log(error.message)
    res.status(500).json({message : "Internal server error"})
  }
}

// API endpoint to add items to a specific category in a restaurant

const addItemController=async(req,res)=>{
  try {
    const restaurantId = req.params.id;
    const categoryName = req.params.categoryName;

    const restaurant = await restaurantModel.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const result=await cloudinary.v2.uploader.upload(req.file.path)

    const newItem=await itemModel({
    name:req.body.name,
    description:req.body.description,
    price:req.body.price,
    image:result.secure_url,
    })

    const savedItem = await newItem.save();

    // Add the item to the specified category
    const category = restaurant.categories.find((c) => c.name === categoryName);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.items.push(savedItem._id);
    const savedRestaurant = await restaurant.save();
    res.json(savedRestaurant);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const getRestaurantController=async(req,res)=>{
  try {
    const restaurants=await restaurantModel.find();
    res.send(restaurants);
  } catch (error) {
    console.log(error.message)
  }
}

const deleteRestaurantController=async(req,res)=>{
  try {

    const restaurant=await restaurantModel.findById(req.params.restaurantId)

    const restaurants=await restaurantModel.findByIdAndDelete(req.params.restaurantId);

     // Delete the restaurant image from Cloudinary
     await cloudinary.v2.uploader.destroy(getPublicId(restaurant.image));

     res.status(200).json({message:"restaurant deleted",restaurants})

    
  } catch (error) {
    console.log(error.message)
    res.status(500).json({message:"Internal server error"})

  }
}

const getPublicId = (url) => {
  const startIndex = url.lastIndexOf('/') + 1;
  const endIndex = url.lastIndexOf('.');
  return url.substring(startIndex, endIndex);
};



export {homeController,addRestaurantController,getRestaurantController,deleteRestaurantController,addItemController}