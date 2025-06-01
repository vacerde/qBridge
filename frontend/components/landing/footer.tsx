import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code, Github, Twitter, Linkedin } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">DF</span>
              </div>
              <span className="font-semibold text-lg">DevForge</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              A comprehensive development platform for teams to build, collaborate, and deploy software projects.
            </p>
            <div className="flex space-x-6">
              <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Product</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link href="#features" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/integrations" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Integrations
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/changelog" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Changelog
                    </Link>
                  </li>
                  <li>
                    <Link href="/roadmap" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Roadmap
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">Support</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link href="/docs" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/api" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      API Reference
                    </Link>
                  </li>
                  <li>
                    <Link href="/status" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Status
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Company</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link href="/about" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">Legal</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/security" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                      Security
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t pt-8">
          <p className="text-xs leading-5 text-muted-foreground">
            &copy; {currentYear} DevForge, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}