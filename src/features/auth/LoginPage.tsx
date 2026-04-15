import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/design-system/button"
import { Card } from "@/design-system/card"
import { Input } from "@/design-system/input"
import { authClient } from "@/platform/auth/auth-client"
import { ROUTES } from "@/platform/config/routes"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type LoginForm = z.infer<typeof formSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const form = useForm<LoginForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await authClient.login(values.email, values.password)
    navigate({ to: ROUTES.overview })
  })

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-accent">Login</div>
          <h1 className="text-3xl font-semibold">Open the new product surface</h1>
          <p className="text-sm text-muted">
            Session auth remains cookie-based and compatible with the existing backend.
          </p>
        </div>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input placeholder="you@company.com" {...form.register("email")} />
          <Input type="password" placeholder="Password" {...form.register("password")} />
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  )
}
