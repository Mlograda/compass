const mongoose = require('mongoose');

const Review = require('./review')
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})
const CampgroundSchema = new Schema({
    title: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    price: Number,
    images: [imageSchema],
    description: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
}, opts)

CampgroundSchema.virtual('properties.popup').get(function() {

    return `<a class =${`popup-title`} href= ${`/campgrounds/${this._id}`}>${this.title}</a><img class =${`popup-image`} src=${`${this.images[0].thumbnail}`}>`
})

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } })
    }
})

const Campground = mongoose.model('Campground', CampgroundSchema)
module.exports = Campground;

