import { Navigate, useParams } from "@tanstack/react-router"

import { LlmPage } from "@/features/llm/LlmPage"
import { MarketingPage } from "@/features/marketing/MarketingPage"
import { SaturationDetailPage } from "@/features/saturation/SaturationDetailPage"
import { ROUTES } from "@/platform/config/routes"

export function createMarketingPage(path: string) {
  return function MarketingRouteComponent() {
    return <MarketingPage path={path} />
  }
}

export function createLlmSectionPage(section: string) {
  return function LlmSectionRoute() {
    return <LlmPage section={section} />
  }
}

export function SaturationDatastoreRoute() {
  const { system } = useParams({ strict: false })
  return <SaturationDetailPage entity="datastore" value={system} />
}

export function SaturationTopicRoute() {
  const { topic } = useParams({ strict: false })
  return <SaturationDetailPage entity="topic" value={topic} />
}

export function SaturationGroupRoute() {
  const { groupId } = useParams({ strict: false })
  return <SaturationDetailPage entity="group" value={groupId} />
}

export function LegacyLogsPatternsRoute() {
  return <Navigate to={ROUTES.logs} replace />
}

export function LegacyLogsTransactionsRoute() {
  return <Navigate to={ROUTES.logs} replace />
}

export function LegacyErrorsRoute() {
  return <Navigate to={ROUTES.overview} search={{ tab: "errors" }} replace />
}

export function LegacyAiRoute() {
  return <Navigate to={ROUTES.llmOverview} replace />
}

export function LegacyLlmRoute() {
  return <Navigate to={ROUTES.llmOverview} replace />
}

export function LegacyServiceRoute() {
  const { serviceName } = useParams({ strict: false })
  return <Navigate to={ROUTES.service} search={{ serviceName }} replace />
}

export function LegacySaturationDatabaseRoute() {
  const { dbSystem } = useParams({ strict: false })
  return (
    <Navigate
      to={ROUTES.saturationDatastoreDetail.replace("$system", dbSystem ?? "unknown")}
      replace
    />
  )
}

export function LegacySaturationRedisRoute() {
  const { instance } = useParams({ strict: false })
  return (
    <Navigate
      to={ROUTES.saturationDatastoreDetail.replace("$system", "redis")}
      search={{ instance }}
      replace
    />
  )
}
