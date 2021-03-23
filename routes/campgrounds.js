const express = require('express');
const router = express.Router();

const campgrounds = require('../controllers/campgrounds')
const catchAsync = require("../utilities/catchAsync");

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage: storage });

const { isLoggedIn, isCampgroundAuthor, validateCampground } = require('../middleware');



/*LIST ALL CAMPS*/
router.get("/", campgrounds.getIndex);

/*CREATE NEW CAMP*/
router.get("/new", isLoggedIn, campgrounds.getNewCampgroundForm);
router.post("/", upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.postNewCampground));

/*SHOW CAMP DETAILS*/
router.get("/:id", catchAsync(campgrounds.getShowCampgrond));

/*EDIT CAMP*/
router.get("/:id/edit", isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.getEditCampground));

router.patch("/:id", isLoggedIn, isCampgroundAuthor, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.postEditCampground));

/*DELETE EXISTING CAMP*/

router.delete("/:id", isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router