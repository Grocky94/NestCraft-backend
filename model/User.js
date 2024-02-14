import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true,
        maxlength: 25,
        minlength: 4
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        trim: true,
    }
})

const User = mongoose.model("user", userSchema);

export default User;