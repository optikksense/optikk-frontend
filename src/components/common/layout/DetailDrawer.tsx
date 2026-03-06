import { Drawer, Descriptions, Typography } from 'antd';
import { ReactNode } from 'react';
import './DetailDrawer.css';

const { Text } = Typography;

interface DetailDrawerField {
  label: string;
  key: string;
  render?: (value: any, data: any) => ReactNode;
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
  data: any;
  extra?: ReactNode;
}

/**
 * Generic slide-out drawer for viewing details of any record.
 * @param root0
 * @param root0.open
 * @param root0.onClose
 * @param root0.title
 * @param root0.width
 * @param root0.sections
 * @param root0.data
 * @param root0.extra
 */
export default function DetailDrawer({
  open,
  onClose,
  title = 'Details',
  width = 640,
  sections = [],
  data,
  extra,
}: DetailDrawerProps) {
  if (!data) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      width={width}
      className="detail-drawer"
      zIndex={1100}
      styles={{ header: { paddingTop: 16 } }}
    >
      {sections.map((section, idx) => (
        <div key={idx} className="detail-drawer-section">
          {section.title && (
            <h4 className="detail-drawer-section-title">{section.title}</h4>
          )}
          <Descriptions column={1} size="small" bordered>
            {section.fields.map((field) => (
              <Descriptions.Item key={field.key} label={field.label}>
                {field.render
                  ? field.render(data[field.key], data)
                  : renderValue(data[field.key])}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      ))}

      {extra}
    </Drawer>
  );
}

function renderValue(value: any) {
  if (value == null) return <Text type="secondary">-</Text>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(value, null, 2)}</pre>;
  return String(value);
}
