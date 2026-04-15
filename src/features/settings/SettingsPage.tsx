import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function SettingsPage() {
  return (
    <PageFrame
      title="Settings"
      subtitle="Profile, preferences, and team settings will be rebuilt on strict form and decode boundaries."
      eyebrow="Product"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>Profile</Card>
        <Card>Preferences</Card>
        <Card>Team</Card>
      </div>
    </PageFrame>
  )
}
