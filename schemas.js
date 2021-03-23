const BaseJoi = require('joi');

const sanitizeHTML = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: { 'string.blockHTML': '{{#label}} must not contain an HTML tag' },
    rules: {
        blockHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                    allowedIframeHostnames: []
                })

                if (clean !== value) return helpers.error('string.blockHTML', { value });
                return clean;

            }
        }
    }
})

const Joi = BaseJoi.extend(extension)



module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().blockHTML(),
        price: Joi.number().min(0).required(),
        location: Joi.string().required().blockHTML(),
        description: Joi.string().required().blockHTML(),
    }).required(), deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required().blockHTML()
    }).required()
})

module.exports.userSchema = Joi.object({
    username: Joi.string().min(4).max(30).required().blockHTML(),
    email: Joi.string()
        .email({ minDomainSegments: 2 }).required().blockHTML(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9@]{3,30}$')).required(),
    repeatPassword: Joi.ref('password'),
}).required()

exports.passwordSchema = Joi.object({
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9@]{3,30}$')).required(),
    repeatPassword: Joi.ref('password'),
})