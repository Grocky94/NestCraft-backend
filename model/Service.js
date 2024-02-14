import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a service name"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, "maximum 200 character limit"],
    },
    color: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }

})

const Service = mongoose.model("service", serviceSchema);
export default Service;