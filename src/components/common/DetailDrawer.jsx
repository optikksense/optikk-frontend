import { Drawer, Descriptions, Tag, Typography } from 'antd';
import { formatTimestamp } from '@utils/formatters';
import './DetailDrawer.css';

const { Text } = Typography;

/**
 * Generic slide-out drawer for viewing details of any record.
 * Used by LogsPage (log detail), TracesPage (trace detail), IncidentsPage (incident detail).
 *
 * @param {boolean} open - Whether the drawer is open
 * @param {Function} onClose - Close callback
 * @param {string} title - Drawer title
 * @param {number} width - Drawer width
 * @param {Array} sections - Array of { title, fields: [{ label, key, render }] }
 * @param {Object} data - The record data to display
 * @param {ReactNode} extra - Additional content below sections
 */
export default function DetailDrawer({
  open,
  onClose,
  title = 'Details',
  width = 640,
  sections = [],
  data,
  extra,
}) {
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

function renderValue(value) {
  if (value == null) return <Text type="secondary">-</Text>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(value, null, 2)}</pre>;
  return String(value);
}
