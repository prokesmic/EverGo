import { Suspense } from "react"
import ResetPasswordClient from "./reset-password-client"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  )
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-200">
        Loading reset form...
      </div>
    </div>
  )
}
