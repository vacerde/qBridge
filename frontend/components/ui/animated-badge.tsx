import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import ShinyText from "@/components/magicui/animated-shiny-text";

export interface AnimatedBadgeProps {
    icon?: React.ReactNode;
    text: string;
    className?: string;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
    icon = <ArrowRightIcon className="mr-1 size-3" />,
    text,
    className,
}) => (
    <div className={cn("z-10 flex min-h-64 items-center justify-center", className)}>
        <div
            className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            )}
        >
            <ShinyText className="px-3 py-1" text={icon + " " + text} />
        </div>
    </div>
);

export default AnimatedBadge;
