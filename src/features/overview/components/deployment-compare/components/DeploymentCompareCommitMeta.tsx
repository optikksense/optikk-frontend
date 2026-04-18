import { ExternalLink, GitCommit, GitPullRequest, User } from "lucide-react";
import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Badge, Card } from "@shared/components/primitives/ui";

interface Props {
  readonly compare: DeploymentCompareResponse;
}

function shortSha(sha: string): string {
  return sha.slice(0, 12);
}

function hasAnyMeta(deployment: DeploymentCompareResponse["deployment"]): boolean {
  return Boolean(
    deployment.commit_sha ||
      deployment.commit_author ||
      deployment.repo_url ||
      deployment.pr_url
  );
}

function ExternalLinkRow({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-primary)] hover:underline"
    >
      {icon}
      <span className="truncate">{label}</span>
      <ExternalLink size={11} className="shrink-0 opacity-70" />
    </a>
  );
}

function DeploymentCompareCommitMetaComponent({ compare }: Props) {
  const deployment = compare.deployment;
  if (!hasAnyMeta(deployment)) return null;

  const sha = deployment.commit_sha ?? "";
  const author = deployment.commit_author ?? "";
  const repoURL = deployment.repo_url ?? "";
  const prURL = deployment.pr_url ?? "";

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="mb-3">
        <h3 className="m-0 font-semibold text-[var(--text-primary)]">Source control</h3>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Git / VCS attributes emitted by the instrumenting service.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {sha ? (
          <div className="inline-flex items-center gap-2">
            <GitCommit size={14} className="text-[var(--text-muted)]" />
            <Badge variant="default">{shortSha(sha)}</Badge>
          </div>
        ) : null}
        {author ? (
          <div className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
            <User size={13} className="text-[var(--text-muted)]" />
            <span>{author}</span>
          </div>
        ) : null}
        {repoURL ? (
          <ExternalLinkRow
            icon={<GitCommit size={13} />}
            label="Repository"
            href={repoURL}
          />
        ) : null}
        {prURL ? (
          <ExternalLinkRow
            icon={<GitPullRequest size={13} />}
            label="Pull request"
            href={prURL}
          />
        ) : null}
      </div>
    </Card>
  );
}

export const DeploymentCompareCommitMeta = memo(DeploymentCompareCommitMetaComponent);
