"use server";

import { User } from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { revalidatePath } from "next/cache";

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

export async function findOneUserBy(attrs: any) {
  try {
    await connectToDatabase();

    const foundUser = await User.findOne(attrs);

    if (!foundUser) {
      throw new Error("User not found!");
    }

    return JSON.parse(JSON.stringify(foundUser));
  } catch (error) {
    handleError(error);
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const foundUser = await User.findById(userId);

    if (!foundUser) {
      throw new Error("User not found!");
    }

    return JSON.parse(JSON.stringify(foundUser));
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      {
        clerkId,
      },
      user,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      throw new Error("Failed to update User!");
    }

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    const deletedUser = await User.findOneAndDelete({
      clerkId,
    });

    if (!deletedUser) {
      throw new Error("Failed to delete User!");
    }

    revalidatePath("/");

    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUserById(userId: string) {
  try {
    await connectToDatabase();

    const deletedUser = await User.findByIdAndDelete(userId);
    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    const updatedUserCredits = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $inc: { creditBalance: creditFee },
      },
      {
        new: true,
      }
    );

    if (!updatedUserCredits) {
      throw new Error("User credits update failed!");
    }

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (e) {
    handleError(e);
  }
}
