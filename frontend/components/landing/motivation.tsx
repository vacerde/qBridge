"use client"
import { TextReveal } from "@/components/magicui/text-reveal";
import { Zap, Users, Bot, Server, Rocket, Shield } from "lucide-react";

export function LandingMotivation() {
    return (
        <section id="motivation" className="relative py-32 overflow-hidden">

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section 1: Problem Statement with Icon */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                    <div className="flex-1 space-y-4">
                        <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            qBridge combines workspace management,
                        </TextReveal>
                        <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            real-time collaboration and AI assistance
                        </TextReveal>
                    </div>
                    {/* Visual Element */}
                    <div className="flex-1 flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-3xl blur-2xl" />
                            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-12 shadow-xl border border-neutral-200 dark:border-neutral-800">
                                <Zap className="w-16 h-16 text-orange-500 mx-auto mb-6" />
                                <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                                    One Platform, Everything
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex justify-between items-center">
                    <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                        Create isolated development environments.
                    </TextReveal>
                    <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                        Everything in a single integrated environment.
                    </TextReveal>
                </div>

                {/* Section 2: Features with Icon - Reversed */}
                <div className="flex flex-col lg:flex-row-reverse items-center gap-0 mb-32">
                    <div className="flex-1 space-y-4">
                        <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            Work with your team simultaneously.
                        </TextReveal>
                        <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            Get help from multiple AI providers.
                        </TextReveal>
                        <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            Connect via SSH for seamless transfers.
                        </TextReveal>
                        <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            Deploy directly from the platform.
                        </TextReveal>
                    </div>


                    {/* Visual Element */}
                    <div className="flex-1 flex justify-center lg:justify-start">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 rounded-2xl blur-xl" />
                                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                                    <Users className="w-8 h-8 text-blue-500 mb-2" />
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Collaborate</div>
                                </div>
                            </div>
                            <div className="relative mt-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 rounded-2xl blur-xl" />
                                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                                    <Bot className="w-8 h-8 text-purple-500 mb-2" />
                                    <div className="text-xs text-gray-600 dark:text-gray-400">AI Assist</div>
                                </div>
                            </div>
                            <div className="relative -mt-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 opacity-20 rounded-2xl blur-xl" />
                                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                                    <Server className="w-8 h-8 text-green-500 mb-2" />
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Isolated</div>
                                </div>
                            </div>
                            <div className="relative mt-4">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 rounded-2xl blur-xl" />
                                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                                    <Rocket className="w-8 h-8 text-violet-500 mb-2" />
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Deploy</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Section 3: Tech Stack with Icon */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                    <div className="flex-1">
                        <TextReveal className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            Built with Next.js and Powered by Docker containers.
                        </TextReveal>
                        <TextReveal className="flex justify-end text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            Secured with enterprise-grade encryption.
                        </TextReveal>
                    </div>

                    {/* Visual Element */}
                    <div className="flex-1 flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-20 rounded-3xl blur-2xl" />
                            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-12 shadow-xl border border-neutral-200 dark:border-neutral-800">
                                <Shield className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                                <div className="text-center space-y-2">
                                    <div className="text-sm font-medium text-neutral-900 dark:text-white">Enterprise Ready</div>
                                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Next.js • Rust • Docker</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Section: Brand Statement */}
                <div className="text-right space-y-4">
                    <TextReveal className="flex justify-center text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                        Welcome to the future of development.
                    </TextReveal>
                </div>
            </div>
        </section>
    );
}