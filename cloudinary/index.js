const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
//THE BELOW PARAMS NEEDS TO BE AQUIRED FROM YOUR CLOUDINARY ACCOUNT
//CLOUDINARY_CLOUD_NAME='YOUR CLOUDINARY NAME'
//CLOUDINARY_KEY='YOUR CLOUDINARY KEY'
//CLOUDINARY_SECRET='YOUR CLOUDINARY SECRET'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Compass',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

const UserStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'User',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});



module.exports = {
    cloudinary,
    storage,
    UserStorage
}