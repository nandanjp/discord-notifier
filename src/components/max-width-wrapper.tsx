import { cn } from "@/lib/utils"

export const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => (
  <div
    className={cn(
      "size-full mx-auto max-w-screen-xl px-2.5 md:px-20",
      className
    )}
  >
    {children}
  </div>
)
