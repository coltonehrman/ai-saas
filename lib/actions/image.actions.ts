"use server";

import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { User } from "../database/models/user.model";
import { Image } from "../database/models/image.model";
import { redirect } from "next/navigation";
import { Query } from "mongoose";

async function populateUser(query: Query<any, any>) {
  return query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName",
  });
}

export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found!");
    }

    const newImage = await Image.create({
      ...image,
      author: author.id,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (e) {
    handleError(e);
  }
}

export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate) {
      throw new Error("Image not found!");
    }

    if (imageToUpdate.author.toHexString() !== userId) {
      throw new Error("User not allowed to modify Image!");
    }

    const updatedImage = await Image.findByIdAndUpdate(image._id, image, {
      new: true,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (e) {
    handleError(e);
  }
}

export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (e) {
    handleError(e);
  } finally {
    redirect("/");
  }
}

export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if (!image) {
      throw new Error("Image not found!");
    }

    return JSON.parse(JSON.stringify(image));
  } catch (e) {
    handleError(e);
  }
}

export async function getAllImages({
  limit = 10,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page?: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
      secure: true,
    });

    let expression = `folder=imaginify`;

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    // console.log(resources);

    const publicIds = resources.map((r: any) => r.public_id);

    let query = {};

    if (searchQuery) {
      query = {
        publicId: {
          $in: publicIds,
        },
      };
    }

    const skip = (Number(page) - 1) * limit;

    const images = await populateUser(
      Image.find(query)
        .sort({
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
    );

    const totalImages = await Image.find(query).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (e) {
    handleError(e);
  }
}
