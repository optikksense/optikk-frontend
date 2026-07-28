import type { CreateMonitorPayload, Monitor } from "../../api/monitorsApi";

                                                                               
                                                                                
                                                                                 
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
