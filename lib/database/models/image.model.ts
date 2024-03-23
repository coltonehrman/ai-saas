import { Document, Schema, Types, model, models } from "mongoose";

export interface IImage extends Document {
  title: string;
  transformationType: string;
  secureUrl: string;
  publicId: string;
  transformationUrl?: string;
  width?: number;
  height?: number;
  config?: object;
  aspectRatio?: string;
  color?: string;
  prompt?: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  transformationType: {
    type: String,
    required: true,
  },
  secureUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  transformationUrl: {
    type: String,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  config: {
    type: Object,
  },
  aspectRatio: {
    type: String,
  },
  color: {
    type: String,
  },
  prompt: {
    type: String,
  },
  author: {
    type: Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Image = models?.Image || model("Image", ImageSchema);
