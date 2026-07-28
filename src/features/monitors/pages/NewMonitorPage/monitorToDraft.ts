import type { CreateMonitorPayload, Monitor } from "../../api/monitorsApi";

// Projects a saved Monitor onto the wizard's CreateMonitorPayload draft so the
// wizard can edit it. Monitor is a superset of the create payload, so this is a
// field selection — runtime/state fields (id, status, currentValue, …) drop off.
export function monitorToDraft(monitor: Monitor): CreateMonitorPayload {
  return {
    name: monitor.name,
    type: monitor.type,
    priority: monitor.priority,
    scope: monitor.scope,
    query: monitor.query,
    conditions: monitor.conditions,
    notify: monitor.notify,
    messageBody: monitor.messageBody,
    runbookUrl: monitor.runbookUrl,
    tags: monitor.tags,
    evalEverySec: monitor.evalEverySec,
    renotifyEverySec: monitor.renotifyEverySec,
  };
}
