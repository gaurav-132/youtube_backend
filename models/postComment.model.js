import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the schema for PostComment
const postCommentSchema = new Schema(
    {
        comment: {
            type: String,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference the 'User' model
            required: true,
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Video", 
            required: true,
        },
        parentCommentId: {
            type: Schema.Types.ObjectId,
            ref: "PostComment",
            default: null,
        }
    },
    {
        timestamps: true // Automatically add createdAt and updatedAt fields
    }
);

// Apply mongoose-aggregate-paginate-v2 plugin to the schema
postCommentSchema.plugin(mongooseAggregatePaginate);

export const PostComment = mongoose.model("PostComment", postCommentSchema);

