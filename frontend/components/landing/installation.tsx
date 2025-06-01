import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";
import AnimatedBadge from "../ui/animated-badge";

export function LandingInstallation() {
  return (
    <div id="installation" className="h-auto py-24 sm:py-32">
      <div className="h-auto mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">


          <AnimatedBadge icon="🔧" text="How to install" />

          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Running qBridge made easy
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            The qBridge CLI tool simplifies the process of setting up and managing your project, allowing you to focus on building your application without worrying about the underlying infrastructure.
          </p>
        </div>
        <div className="mx-auto flex justify-center items-start mt-10">
          <Terminal className="min-h-full">
            <TypingAnimation>&gt; ./run.sh</TypingAnimation>
            <AnimatedSpan delay={1000} className="text-yellow-500">
              <span>🔎 Checking dependencies...</span>
            </AnimatedSpan>
            <AnimatedSpan delay={1500} className="text-green-500">
              <span>✓ Dependencies verified</span>
            </AnimatedSpan>
            <AnimatedSpan delay={2000} className="text-yellow-500">
              <span>🗄️ Starting database...</span>
            </AnimatedSpan>
            <AnimatedSpan delay={2500} className="text-gray-400 font-mono text-sm">
              <span>2173ec63dde64bd2aadc71b6c3954a2ea6eb360580602b514b398fac816ce3dc</span>
            </AnimatedSpan>
            <AnimatedSpan delay={3500} className="text-green-500">
              <span>✓ Database running</span>
            </AnimatedSpan>
            <AnimatedSpan delay={4000} className="text-yellow-500">
              <span>🔧 Starting backend...</span>
            </AnimatedSpan>
            <AnimatedSpan delay={4500} className="text-green-500">
              <span>✓ Backend running (PID: 2241891)</span>
            </AnimatedSpan>
            <AnimatedSpan delay={5000} className="text-yellow-500">
              <span>🌐 Starting frontend...</span>
            </AnimatedSpan>
            <AnimatedSpan delay={5500} className="text-green-500">
              <span>✓ Frontend running (PID: 2242174)</span>
            </AnimatedSpan>
            <AnimatedSpan delay={6000} className="text-green-500">
              <span>🎉 All services started successfully!</span>
            </AnimatedSpan>
            <AnimatedSpan delay={65000} className="text-muted-foreground">
              Starting window manager in 1 second...
            </AnimatedSpan>
            <AnimatedSpan delay={8000} className="text-green-500 font-bold">
              <span>🚀 qBridge Development Platform is now running!</span>
            </AnimatedSpan>
            <AnimatedSpan delay={9000} className="text-muted-foreground">
              <span>All services are operational and ready for development.</span>
            </AnimatedSpan>
          </Terminal>
        </div>
      </div>
    </div>
  );
}