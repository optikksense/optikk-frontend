export const INFRA_TAB = {
  hosts: "hosts",
  containers: "containers",
} as const;

export type InfraTabId = (typeof INFRA_TAB)[keyof typeof INFRA_TAB];

export const URL_TAB = "tab";
