interface InputProps extends Omit<React.ComponentPropsWithRef<"input">, "size"> {
  allowClear?: boolean;
  size?: "small" | "middle" | "large";
  variant?: "default" | "search";
}
