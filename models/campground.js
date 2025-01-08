const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

campgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        const res = await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
        console.log(res)
    }
})

module.exports = mongoose.model('Campground', campgroundSchema)