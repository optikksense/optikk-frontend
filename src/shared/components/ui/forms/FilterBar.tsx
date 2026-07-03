interface FilterSearchConfig {
  type: "search";
  key: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  width?: number;
}

interface FilterSelectConfig {
  type: "select";
  key: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  value?: string | number;
  onChange?: (value: string | number | null) => void;
  width?: number;
  allowClear?: boolean;
}
