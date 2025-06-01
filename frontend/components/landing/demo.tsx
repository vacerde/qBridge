"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function LandingDemo() {
  const [activeTab, setActiveTab] = useState("workspace");

  return (
    <div id="demo" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            See It In Action
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Experience the power of DevForge
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Explore the key features of our platform through these interactive demos.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <Tabs defaultValue="workspace" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="workspace">Workspace Management</TabsTrigger>
              <TabsTrigger value="collaboration">Real-time Collaboration</TabsTrigger>
              <TabsTrigger value="ai">AI Assistance</TabsTrigger>
            </TabsList>
            <TabsContent value="workspace" className="mt-0">
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-card relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex flex-col justify-end p-8">
                      <h3 className="text-2xl font-bold text-white mb-2">Create and manage workspaces</h3>
                      <p className="text-white/80 max-w-md mb-4">
                        Easily create isolated development environments for your projects with preconfigured templates.
                      </p>
                      <div>
                        <Button size="sm">
                          Try it now <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 top-0 w-3/5 p-4">
                      <div className="w-full h-full rounded-md bg-black border border-white/20 shadow-2xl overflow-hidden">
                        <div className="h-8 bg-black border-b border-white/20 flex items-center px-3 gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="text-white/70 text-xs ml-2">Workspace Management</div>
                        </div>
                        <div className="p-4 text-white/80 font-mono text-xs">
                          <div className="flex gap-2 items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <div>React Project</div>
                          </div>
                          <div className="flex gap-2 items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <div>Python API</div>
                          </div>
                          <div className="flex gap-2 items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                            <div>Machine Learning</div>
                          </div>
                          <div className="mt-4 p-2 bg-white/10 rounded text-white">
                            Create new workspace...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="collaboration" className="mt-0">
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-card relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex flex-col justify-end p-8">
                      <h3 className="text-2xl font-bold text-white mb-2">Collaborate in real-time</h3>
                      <p className="text-white/80 max-w-md mb-4">
                        Work with your team on the same codebase simultaneously with multi-cursor editing and presence indicators.
                      </p>
                      <div>
                        <Button size="sm">
                          Try it now <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 top-0 w-3/5 p-4">
                      <div className="w-full h-full rounded-md bg-black border border-white/20 shadow-2xl overflow-hidden">
                        <div className="h-8 bg-black border-b border-white/20 flex items-center px-3 gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="text-white/70 text-xs ml-2">app.js - Collaborative Editing</div>
                        </div>
                        <div className="p-4 text-white/80 font-mono text-xs">
                          <div className="flex gap-2 mb-2">
                            <span className="text-blue-400">function</span> 
                            <span className="text-yellow-300">calculateTotal</span>
                            <span>(items) {`{`}</span>
                          </div>
                          <div className="pl-4 flex gap-2 mb-2">
                            <span className="text-blue-400">return</span> 
                            <span>items.</span>
                            <span className="text-green-300">reduce</span>
                            <span>((sum, item) =&gt; sum + item.price, 0);</span>
                          </div>
                          <div className="mb-2">{`}`}</div>
                          <div className="flex gap-2 relative">
                            <span className="absolute -left-3 top-0 w-2 h-full bg-purple-500"></span>
                            <span className="text-blue-400">function</span> 
                            <span className="text-yellow-300">applyDiscount</span>
                            <span>(total, discount) {`{`}</span>
                          </div>
                          <div className="flex items-center gap-1 absolute right-8 top-36 text-white/60 bg-purple-500/20 px-2 py-0.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span>Sarah</span>
                          </div>
                          <div className="pl-4 flex gap-2 mb-2">
                            <span className="text-blue-400">return</span> 
                            <span>total * (1 - discount / 100);</span>
                          </div>
                          <div>{`}`}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai" className="mt-0">
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-card relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex flex-col justify-end p-8">
                      <h3 className="text-2xl font-bold text-white mb-2">AI-powered assistance</h3>
                      <p className="text-white/80 max-w-md mb-4">
                        Get intelligent suggestions, code explanations, and help debugging from multiple AI providers.
                      </p>
                      <div>
                        <Button size="sm">
                          Try it now <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 top-0 w-3/5 p-4">
                      <div className="w-full h-full rounded-md bg-black border border-white/20 shadow-2xl overflow-hidden">
                        <div className="h-8 bg-black border-b border-white/20 flex items-center px-3 gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="text-white/70 text-xs ml-2">AI Assistant</div>
                        </div>
                        <div className="p-4 text-white/80 font-mono text-xs grid grid-cols-1 gap-3">
                          <div className="p-2 rounded bg-blue-500/20 text-white">
                            Explain this code and suggest optimizations
                          </div>
                          <div className="p-2 rounded bg-gray-600/50 text-white">
                            <p className="mb-2">This code implements a recursive function to calculate Fibonacci numbers:</p>
                            <p className="mb-2">The time complexity is O(2^n) which is inefficient for large values. I recommend:</p>
                            <p>1. Use memoization to store previously calculated values</p>
                            <p>2. Consider an iterative approach instead of recursion</p>
                            <p>3. For large values, use a matrix exponentiation approach</p>
                          </div>
                          <div className="p-2 rounded bg-gray-600/50 text-white">
                            <p className="font-bold mb-2">Optimized implementation:</p>
                            <p className="text-green-300">function fib(n, memo = {}) {`{`}</p>
                            <p className="pl-4">if (n in memo) return memo[n];</p>
                            <p className="pl-4">if (n &lt;= 1) return n;</p>
                            <p className="pl-4">memo[n] = fib(n-1, memo) + fib(n-2, memo);</p>
                            <p className="pl-4">return memo[n];</p>
                            <p>{`}`}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center">
            <Link href="/demo">
              <Button size="lg">
                View full demo <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}