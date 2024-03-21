import { SignUp } from "@clerk/nextjs";
import React from "react";

const SignUpPage = () => {
  return <SignUp afterSignInUrl="/" afterSignUpUrl="/" signInUrl="/signin" />;
};

export default SignUpPage;
