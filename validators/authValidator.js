import { z } from 'zod';


const signUpSchema = z.object({
    username: z.string({
        required_error: "Username is required"
    })
        .trim()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(255, { message: "Username should not be more than 255 characters" }),

    email: z.string({
        required_error: "Email is required"
    })
        .trim()
        .email({ message: 'Email is invalid' })
        .min(3, { message: "Email must be at least 3 characters" })
        .max(255, { message: "Email should not be more than 255 characters" }),

    phone: z.string({ required_error: "Phone is required" })
        .trim()
        .min(10, { message: "Phone number must be at least 10 characters" })
        .max(10, { message: "Phone should not be more than 10 characters" }),

    password: z.string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(1024, { message: "Password should not be more than 1024 characters" }),

});

const loginSchema = z.object({
    email: z.string({ required_error: "Email is required" }),
    password: z.string({ required_error: "Password is required" })
});



export { signUpSchema, loginSchema };
