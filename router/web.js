import express from "express";
import multer from 'multer';
import path from 'path';
import { addItemController, addRestaurantController, deleteRestaurantController, getRestaurantController, homeController } from "../controller/homeController.js";
const router=express.Router();
import cloudinary from 'cloudinary';


// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: 'dkby5wtrt',
    api_key: '981471163326169',
    api_secret: 'sW1INuTQ2RmfaEHl60k0W5_CW5g',
  });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(process.cwd(),'/public/images/'))
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + '-' + file.originalname
      cb(null,fileName )
    }
  })
  
  const upload = multer({ storage: storage })


router.get('/',homeController)  

router.post('/addRestaurant',upload.single('image'),addRestaurantController)

router.post('/addRestaurant/:id/category/:categoryName/item',upload.single('image'),addItemController)

router.get('/getRestaurants',getRestaurantController)

router.delete('/deleteRestaurant/:restaurantId',deleteRestaurantController)

export default router;