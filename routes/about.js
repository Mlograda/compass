const express = require('express')
const router = express.Router();

const about = require('../controllers/about');
const catchAsync = require('../utilities/catchAsync');

router.get('/compass', catchAsync(about.getAboutCompass))
router.get('/development', catchAsync(about.getAboutDevolepment))

module.exports = router