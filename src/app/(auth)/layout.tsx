import { Navbar } from "@/components/navbar"
import { PropsWithChildren } from "react"

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
