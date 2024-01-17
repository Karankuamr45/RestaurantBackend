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


const addCategoryController= async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const { categoryName } = req.body;

    // Check if the restaurant exists
    const existingRestaurant = await restaurantModel.findById(restaurantId);
    if (!existingRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create a new category
    const newCategory = {
      name: categoryName,
      items: [], // You can initialize the items array as empty or with default values
    };

    // Add the new category to the restaurant's categories array
    existingRestaurant.categories.push(newCategory);

    // Save the updated restaurant document
    const updatedRestaurant = await existingRestaurant.save();

    res.json({ message: 'Category added successfully', restaurant: updatedRestaurant });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}



const deleteItemController= async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item= await itemModel.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Find the category that contains the item
    const category = await restaurantModel.findOne({ 'categories.items': itemId });

    if (!category) {
      return res.status(404).json({ message: 'Category not found for the item' });
    }

    await itemModel.findByIdAndDelete(itemId);

     // Update the restaurantModel to remove the item from the category's items list
     await restaurantModel.updateOne(
      { 'categories.items': itemId },
      { $pull: { 'categories.$.items': itemId } }
    );

    // Delete the restaurant image from Cloudinary
    await cloudinary.v2.uploader.destroy(getPublicId(item?.image));
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}


const deletecategorywithItemsController= async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    // Find the category and its items
    const category = await restaurantModel.findOne({ 'categories._id': categoryId });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

     // Get the item IDs associated with the category
     const itemIds = category.categories[0].items.map(item => item._id);

        // Find the items to get their details
    const items = await itemModel.find({ _id: { $in: itemIds } });

    // Delete the images from Cloudinary for each item
    for (const item of items) {
      await cloudinary.v2.uploader.destroy(getPublicId(item.image));
    }

     // Delete the items from itemModel
     await itemModel.deleteMany({ _id: { $in: itemIds } });

    // Delete the category and its items
    await restaurantModel.updateOne(
      { 'categories._id': categoryId },
      { $pull: { categories: { _id: categoryId } } }
    );

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}


const deleteRestaurantWithEveryThing = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    // Find the restaurant to get its categories and items
    const restaurant = await restaurantModel.findById(restaurantId);

    // Delete the restaurant image from Cloudinary
    await cloudinary.v2.uploader.destroy(getPublicId(restaurant.image));

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Delete the images associated with items in the restaurant
for (const category of restaurant.categories) {
  for (const itemId of category.items) {
    // Find the item in itemModel to get its image information
    const item = await itemModel.findById(itemId);

    if (item && item.image) {
      // Delete the image from Cloudinary using the item's public ID
      await cloudinary.v2.uploader.destroy(getPublicId(item.image));
    }
  }
}


    // Delete items from itemModel
    const itemIds = restaurant.categories.flatMap(category => category.items.map(item => item._id));
    await itemModel.deleteMany({ _id: { $in: itemIds } });

    // Delete the restaurant and its categories
    await restaurantModel.findByIdAndDelete(restaurantId);

    res.json({ message: 'Restaurant and associated data deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};





const getPublicId = (url) => {
  const startIndex = url?.lastIndexOf('/') + 1;
  const endIndex = url?.lastIndexOf('.');
  return url?.substring(startIndex, endIndex);
};



export {homeController,addRestaurantController,getRestaurantController,addItemController,deleteItemController,deletecategorywithItemsController,addCategoryController,deleteRestaurantWithEveryThing}