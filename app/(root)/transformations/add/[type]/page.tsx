import { findOneUserBy } from "@/lib/actions/user.actions";

import Header from "@/components/shared/Header";
import React from "react";
import TransformationForm from "@/components/shared/TransformationForm";
import { auth } from "@clerk/nextjs";
import { transformationTypes } from "@/constants";

const AddTransformationTypePage = async ({
  params: { type },
}: SearchParamProps) => {
  const { userId } = auth();
  const transformation = transformationTypes[type];

  const foundUser = await findOneUserBy({
    clerkId: userId,
  });

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subtitle} />

      <section className="mt-10">
        <TransformationForm
          action="add"
          userId={foundUser._id}
          creditBalance={foundUser.creditBalance}
          type={type}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
