import { useMemo } from "react";

import { useNavigate } from "@tanstack/react-router";

import { buildGenerationColumns } from "../generationColumnDefs";

export function useLlmGenerationsColumns() {
  const navigate = useNavigate();
  return useMemo(() => buildGenerationColumns(navigate), [navigate]);
}
