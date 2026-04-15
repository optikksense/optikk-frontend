import { ExplorerWorkbench } from "@/features/explorer/ExplorerWorkbench"

export function LlmPage({ section }: { readonly section: string }) {
  return (
    <ExplorerWorkbench
      scope={`llm-${section}`}
      title={`LLM ${section}`}
      description="AI-native explorer flows remain first-class in the rewrite."
    />
  )
}
