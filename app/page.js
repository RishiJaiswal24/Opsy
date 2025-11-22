"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router=useRouter();

  useEffect(() => {
    router.push('/')
  }, [])
  
  return (
    <>
      <Button>
        click me
      </Button>
      <SignOutButton>Sign out</SignOutButton>
      <div className="h-4"></div>
      <ul>
        <li>clear all the test thingi</li>
      </ul>
      <div className="h-4"></div>
      <ul>
        <li>langchain</li>
        <li>gemini</li>
        <li>octokit</li>
        <li>vector embedding</li>
        <li>RAG</li>
        <li>schadcn</li>
        <li>Cloudinary</li>
        <li>Assembly Ai</li>
        <li>Razorpay</li>
        <li></li>
      </ul>
    </>
  );
}
