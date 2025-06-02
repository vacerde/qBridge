"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Sparkles, Users } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Build. Collaborate. Deploy.";
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  return (
    <div className="relative isolate overflow-hidden pt-14">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40 lg:px-8">
        <div className="mx-auto ">
          <h1 className="max-w-2xl lg:mx-0 lg:max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            The Complete Development Platform
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-primary h-8 flex items-center">
            {typedText}
            <span
              className="animate-pulse ml-1"
              style={{
                display: "inline-block",
                width: "0.12em",
                height: "1.2em",
                backgroundColor: "white",
                borderRadius: "2px",
                verticalAlign: "middle",
              }}
            ></span>
          </h2>
          <p className="max-w-3xl lg:mx-0 lg:max-w-5xl mt-6 text-lg leading-8 text-muted-foreground">
            qBridge combines powerful IDE capabilities with real-time collaboration and AI assistance to streamline your development workflow. Create, collaborate, and deploy all from one platform.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" className="gap-1.5">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Live demo
              </Button>
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex gap-x-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Code className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Powerful IDE</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Full-featured development environment with language support, debugging, and extensions.
                </p>
              </div>
            </div>
            <div className="flex gap-x-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Real-time Collaboration</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Code together with your team in real-time with multi-cursor editing and presence indicators.
                </p>
              </div>
            </div>
            <div className="flex gap-x-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold">AI Assistance</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Leverage multiple AI providers to help write, debug, and explain code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}