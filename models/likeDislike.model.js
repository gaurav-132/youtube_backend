import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeDislikeSchema = new Schema(
    {
        like: {
            type: Number,
            default:0,
        },

        dislike: {
            type: Number,
            default:0,
        },

        postId: {
            type: Schema.Types.ObjectId,
            ref: "Video", 
            required: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User", 
            required: true,
        }
    }
);

likeDislikeSchema.plugin(mongooseAggregatePaginate);

export const LikeDislike = mongoose.model("LikeDislike", likeDislikeSchema);
