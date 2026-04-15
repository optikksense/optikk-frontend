import { sql } from "@codemirror/lang-sql"
import { oneDark } from "@codemirror/theme-one-dark"
import CodeMirror from "@uiw/react-codemirror"

import { Card } from "@/design-system/card"

export function QueryEditor({
  value,
  onChange,
}: {
  readonly value: string
  readonly onChange: (value: string) => void
}) {
  return (
    <Card className="overflow-hidden p-0">
      <CodeMirror
        value={value}
        height="120px"
        extensions={[sql()]}
        theme={oneDark}
        onChange={onChange}
        basicSetup={{ lineNumbers: false, foldGutter: false }}
      />
    </Card>
  )
}
