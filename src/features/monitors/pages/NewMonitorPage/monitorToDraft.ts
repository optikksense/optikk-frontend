import type { CreateMonitorPayload, Monitor } from "../../api/monitorsApi";

// Projects a saved Monitor onto the wizard's CreateMonitorPayload draft so the
// wizard can edit it. Monitor is a superset of the create payload, so this is a
// field selection — runtime/state fields (id, status, current_value, …) drop off.
export function monitorToDraft(monitor: Monitor): CreateMonitorPayload {
  return {
    name: monitor.name,
    type: monitor.type,
    priority: monitor.priority,
    scope: monitor.scope,
    query: monitor.query,
    conditions: monitor.conditions,
    notify: monitor.notify,
    message_body: monitor.message_body,
    runbook_url: monitor.runbook_url,
    tags: monitor.tags,
    eval_every_sec: monitor.eval_every_sec,
    renotify_every_sec: monitor.renotify_every_sec,
  };
}
