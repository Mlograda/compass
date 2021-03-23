const Campground = require("../models/campground");
const Review = require("../models/review");
const { cloudinary } = require("../cloudinary");

const mbxGeoCode = require('@mapbox/mapbox-sdk/services/geocoding');
const MapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeoCode({ accessToken: MapBoxToken });


/*GET- LIST ALL CAMPS*/
exports.getIndex = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

/*GET - CREATE NEW CAMP*/
exports.getNewCampgroundForm = async (req, res) => {
    res.render("campgrounds/new");
}
/*POST CREATE NEW CAMP*/
exports.postNewCampground = async (req, res, next) => {

    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 2
    }).send()

    const campground = new Campground(req.body.campground);
    if (req.files.length < 1) {
        campground.images = { url: 'https://res.cloudinary.com/dq6oml6je/image/upload/v1616338214/YelpCamp/default-image_ge2l8w.jpg', filename: 'default-image_ge2l8w' }
    } else {
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    }
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id
    await campground.save();
    req.flash('success', 'Successfully made a new campground')

    res.redirect(`/campgrounds/${campground._id}`);
}

/*GET- SHOW CAMP DETAILS*/
exports.getShowCampgrond = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author').populate('reviewAuthor');

    const reviews = await Review.find({ _id: { $in: campground.reviews } }).populate('reviewAuthor');
    if (!campground) {
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }

    res.render("campgrounds/show", { campground, reviews, editStatus: 'False' });
}

/*GET - EDIT EXISTING CAMP*/
exports.getEditCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }
    res.render("campgrounds/edit", { campground });
}

/*POST/PATCH - EDIT EXISTING CAMP*/
exports.postEditCampground = async (req, res) => {

    const campground = await Campground.findByIdAndUpdate(req.params.id, {
        ...req.body.campground,
    });

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    const images = req.files.map(element => ({ url: element.path, filename: element.filename }))

    campground.images.push(...images)
    await campground.save()

    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`);
}

/*DELETE - DELETE XISTING CAMP*/
exports.deleteCampground = async (req, res) => {

    const campground = await Campground.findById(req.params.id);

    campground.images.forEach(img => {
        cloudinary.uploader.destroy(img.filename)
    })
    await Campground.findByIdAndDelete(req.params.id);
    // await Review.deleteMany({ _id: { $in: campground.reviews } })
    req.flash('success', 'Successfully deleted campground')
    res.redirect(`/campgrounds`);
}