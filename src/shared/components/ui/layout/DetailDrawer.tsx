import type { ReactNode } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface DetailDrawerField {
  label: string;
  key: string;
  render?: (value: unknown, data: Record<string, unknown>) => ReactNode;
}

interface DetailDrawerSection {
  title?: string;
  fields: DetailDrawerField[];
}

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  sections?: DetailDrawerSection[];
  data: Record<string, unknown>;
  extra?: ReactNode;
}

export default function DetailDrawer({
  open,
  onClose,
  title = "Details",
  width = 640,
  sections = [],
  data,
  extra,
}: DetailDrawerProps) {
  if (!data) return null;

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      direction="right"
    >
      <DrawerContent className="top-0 right-0 left-auto overflow-auto" style={{ width }}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerClose
            aria-label="Close"
            className="cursor-pointer border-none bg-transparent text-lg leading-none"
          >
            &times;
          </DrawerClose>
        </DrawerHeader>
        <div className="flex-1 overflow-auto px-6 py-4">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {section.title && (
                <h4 className="mb-4 border-[color:var(--glass-border)] border-b pb-2 font-semibold text-[14px] text-[color:var(--text-primary)] tracking-[0.02em]">
                  {section.title}
                </h4>
              )}
              <table className="mb-4 w-full border-collapse text-[13px]">
                <tbody>
                  {section.fields.map((field) => (
                    <tr key={field.key} className="border-border border-b">
                      <td className="w-[30%] px-3 py-2 align-top font-medium">{field.label}</td>
                      <td className="px-3 py-2">
                        {field.render
                          ? field.render(data[field.key], data)
                          : renderValue(data[field.key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {extra}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function renderValue(value: unknown) {
  if (value == null) return <span className="text-[color:var(--text-secondary,#999)]">-</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object")
    return <pre className="m-0 text-xs">{JSON.stringify(value, null, 2)}</pre>;
  return String(value);
}
