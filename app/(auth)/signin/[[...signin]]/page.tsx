import { SignIn } from "@clerk/nextjs";
import React from "react";

const SignInPage = () => {
  return <SignIn afterSignInUrl="/" afterSignUpUrl="/" signUpUrl="/signup" />;
};

export default SignInPage;
