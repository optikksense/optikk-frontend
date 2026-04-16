import { GitBranch, Share2 } from "lucide-react";
import { memo } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui";
import { PageHeader } from "@shared/components/ui";

function TracesPageHeaderComponent() {
  return (
    <PageHeader
      title="Traces"
      icon={<GitBranch size={22} />}
      subtitle="Search, compare, and pivot across traces without leaving the explorer workflow."
      actions={
        <Button
          variant="ghost"
          size="sm"
          icon={<Share2 size={14} />}
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Share link copied");
          }}
        >
          Share
        </Button>
      }
    />
  );
}

export const TracesPageHeader = memo(TracesPageHeaderComponent);
