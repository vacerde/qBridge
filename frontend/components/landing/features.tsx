import {
  GitBranchPlus,
  Code2,
  Users,
  Sparkles,
  Terminal,
  TerminalSquare,
  ServerCrash,
  Shield,
} from "lucide-react";

const features = [
  {
    name: "Workspace Management",
    description:
      "Create and manage isolated development environments with preconfigured templates for various tech stacks.",
    icon: GitBranchPlus,
  },
  {
    name: "Full IDE Experience",
    description:
      "Integrated development environment based on VSCode with full extension support, debugging capabilities, and terminal access.",
    icon: Code2,
  },
  {
    name: "Real-time Collaboration",
    description:
      "Code together with your team in real-time with multi-cursor editing, presence indicators, and integrated chat.",
    icon: Users,
  },
  {
    name: "AI-Powered Assistance",
    description:
      "Leverage multiple AI providers to help write, debug, and explain code with deep context awareness.",
    icon: Sparkles,
  },
  {
    name: "Remote Connectivity",
    description:
      "Connect to remote servers via SSH/SFTP for seamless file transfers and command execution.",
    icon: Terminal,
  },
  {
    name: "Integrated Terminal",
    description:
      "Full terminal access within the browser with persistent sessions and shared access capabilities.",
    icon: TerminalSquare,
  },
  {
    name: "One-Click Deployment",
    description:
      "Deploy your applications with a single click to various cloud providers or your own infrastructure.",
    icon: ServerCrash,
  },
  {
    name: "Enterprise Security",
    description:
      "Secure your code with role-based access controls, audit logging, and encrypted storage.",
    icon: Shield,
  },
];

export function LandingFeatures() {
  return (
    <div id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Accelerate Development
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to build modern applications
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            DevForge combines the best tools and practices into a single platform
            that streamlines your entire development workflow from start to
            finish.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon
                    className="h-5 w-5 flex-none text-primary"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}