import { User } from "../models/user.model.js";

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Invalid Email or Password" });
        }

        console.log("First time nvim");

        const token = await userExist.genrateToken();
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

const register = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        const userExist = await User.findOne({ email: email });

        if (userExist) {
            console.log(userExist);
            return res.status(400).send({ message: "Email already exist" });
        }

        const userCreated = await User.create({ username, email, phone, password });

        console.log(userCreated);

        const token = await userCreated.genrateToken();

        console.log(req.body);
        return res.status(200).send({ msg: "User Resgistered Successfully!", token, userId: userCreated._id.toString(), user: userCreated });
    } catch (error) {
        return res.status(400).send({ msg: error.message });
    }
};

export { login, register };
