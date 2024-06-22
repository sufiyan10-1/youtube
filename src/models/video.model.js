import mongoose,{Schema, SchemaType} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema(
    {
      videoFile: {
        type: String,
        required: true
      },
      thumbnail: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      discription: {
        type: String,
        required: true
      },
      duration: {
        type: Number, //cloudnary
        required: true
      },
      voiews: {
        type: Number,
        default: 0
      },
      isPublished: {
         type: Boolean,
         default: true
      },
      woner: {
        type: Schema.Types.ObjectId,
        ref: "user"
      }

    },{timestamps: true}
)
videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);