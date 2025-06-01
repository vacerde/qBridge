"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export function LandingPricing() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: "Free",
      description: "For personal projects and exploration",
      price: { monthly: 0, annual: 0 },
      features: [
        "1 concurrent workspace",
        "Limited to 3 projects",
        "Community support",
        "Basic IDE features",
        "1 GB storage per workspace",
      ],
      action: "Get started",
      href: "/signup",
      highlighted: false,
    },
    {
      name: "Pro",
      description: "For professionals and small teams",
      price: { monthly: 19, annual: 190 },
      features: [
        "Up to 5 concurrent workspaces",
        "Unlimited projects",
        "Priority support",
        "Full IDE experience",
        "5 GB storage per workspace",
        "Real-time collaboration (up to 3 users)",
        "Custom domain support",
        "Basic AI assistance (100 requests/day)",
      ],
      action: "Start free trial",
      href: "/signup?plan=pro",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Team",
      description: "For growing development teams",
      price: { monthly: 49, annual: 490 },
      features: [
        "Up to 20 concurrent workspaces",
        "Unlimited projects",
        "24/7 priority support",
        "Full IDE experience",
        "20 GB storage per workspace",
        "Real-time collaboration (unlimited users)",
        "Custom domain support",
        "Advanced AI assistance (unlimited)",
        "Team management & access controls",
        "Audit logs & security features",
      ],
      action: "Contact sales",
      href: "/contact",
      highlighted: false,
    },
  ]

  return (
    <div id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Choose the right plan for your team</p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Simple, transparent pricing that scales with your needs. All plans include access to our core platform
            features.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="relative flex items-center rounded-full bg-muted p-1">
            <motion.div
              className="absolute inset-y-1 rounded-full bg-background shadow-sm"
              layout
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            />
            <motion.button
              className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                annual ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setAnnual(true)}
              layout
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{
                  opacity: annual ? 1 : 0.7,
                }}
                transition={{ duration: 0.2 }}
              >
                Annual {annual && "(Save 20%)"}
              </motion.span>
            </motion.button>
            <motion.button
              className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                !annual ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setAnnual(false)}
              layout
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{
                  opacity: !annual ? 1 : 0.7,
                }}
                transition={{ duration: 0.2 }}
              >
                Monthly
              </motion.span>
            </motion.button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-stretch gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan, i) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col h-full ${
                plan.highlighted ? "border-primary shadow-lg scale-105 z-10" : "border-border"
              } rounded-3xl`}
            >
              {plan.badge && (
                <Badge className="absolute top-0 right-6 -translate-y-1/2 bg-primary hover:bg-primary">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 flex-grow">
                <motion.div
                  className="text-3xl font-bold"
                  key={`${plan.name}-${annual ? "annual" : "monthly"}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <motion.span
                    key={annual ? plan.price.annual : plan.price.monthly}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    ${(annual ? plan.price.annual / 12 : plan.price.monthly).toFixed(2)}
                  </motion.span>
                  <span className="text-sm font-normal text-muted-foreground">
                    /month{annual ? " (billed annually)" : ""}
                  </span>
                </motion.div>
                <div className="grid gap-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  <a href={plan.href}>{plan.action}</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-3xl rounded-3xl ring-1 ring-muted p-8">
          <h3 className="text-xl font-bold">Enterprise</h3>
          <p className="mt-2 text-muted-foreground">
            Custom solutions for large organizations with specific requirements.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Dedicated infrastructure</p>
                <p className="text-sm text-muted-foreground">Private deployment options</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">SOC2 compliance</p>
                <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">SSO integration</p>
                <p className="text-sm text-muted-foreground">Connect with your IdP</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">SLA guarantees</p>
                <p className="text-sm text-muted-foreground">99.9% uptime</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button asChild>
              <a href="/contact?plan=enterprise">Contact our sales team</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
