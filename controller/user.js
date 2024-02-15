import User from "../model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import Service from "../model/Service.js";

export const registration = async (req, res) => {
    try {
        const { name, email, password } = req.body.userData;
        // console.log("name:", name, "email:", email, "password:", password)
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Enter all the values" })
        };
        const isUserExist = await User.findOne({ email: email })
        if (isUserExist) {
            return res.status(409).json({ success: false, message: "user already exist" })
        }
        if (password.length < 8) {
            res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name, email, password: hashPassword
        })
        await user.save()
        res.status(201).json({
            success: true,
            message: "user got created",
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body.userData;

        if (!email || !password) {
            return res.status(404).json({ success: false, message: "Enter all the values" })
        }
        const isUser = await User.findOne({ email: email });
        if (!isUser) {
            return res.status(404).json({ success: false, message: "Invalid credentials" })
        }
        const comparePassword = await bcrypt.compare(password, isUser.password);
        if (!comparePassword) {
            return res.status(404).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign({
            id: isUser._id,
        }, process.env.JWT_SECRET_KEY,)


        if (token) {

            const userObj = {
                _id: isUser._id,
                name: isUser.name,
                email: isUser.email,
                token,
            }

            return res.status(200).json({
                success: true,
                message: "user got logged In",
                userObj
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message })
    }
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/mnt/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now()
        cb(null, uniqueSuffix + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    //set file limit to 1 mb
    limits: {
        fileSize: 500000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(JPG|JPEG|GIF|PNG|DOC|DOCX)$/i)) {
            cb(new Error("Invalid file type"));
        } else {
            cb(null, true);
        }
    },
});

export const uploadMiddleware = upload.single("image");

export const addServices = async (req, res) => {
    try {
        if (!req.file || !req.body.name || !req.body.description || !req.body.color || !req.headers.authorization) {
            return res.status(400).json({ success: false, message: "Missing required fields or file" });
        }

        const token = req.headers.authorization.split(" ")[1];

        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { name, description, color } = req.body;
        const image = req.file.filename;
        // console.log("name:", name, "description:", description, "color:", color, "image:", image)
        const userId = decodedData.id;

        const isServiceExist = await Service.findOne({ name, userId });

        if (isServiceExist) {
            return res.status(404).json({ success: false, message: "Service already exists" });
        }

        const newData = new Service({
            name,
            description,
            color,
            image,
            userId,
        });
        await newData.save();

        res.status(200).json({
            success: true,
            message: "Service has been added",
            data: newData
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const deleteSelected = async (req, res) => {
    try {
        const { token, selectedCheckboxes } = req.body;
        if (!token || !selectedCheckboxes || !Array.isArray(selectedCheckboxes)) {
            return res.status(400).json({ success: false, message: "Invalid request format" });
        }
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decodedData.id

        const result = await Service.deleteMany({ userId, _id: { $in: selectedCheckboxes } });
        if (result.deletedCount > 0) {
            return res.status(200).json({ success: true, message: "Products Deleted Successfully." })
        } else {
            return res.status(404).json({ success: false, message: "No matching products found for deletion" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const viewCategory = async (req, res) => {
    try {
        const { token, search, page, limit = 5 } = req.query;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decodedData.id;
        const view = await Service.find({ userId, ...query }).skip(skip).limit(limit).lean();
        if (view.length > 0) {
            return res.status(200).json({ success: true, view })
        } else {
            return res.status(404).json({ success: false, message: "No categories found for this user" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
