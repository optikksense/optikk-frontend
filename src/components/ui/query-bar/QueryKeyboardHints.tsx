/**
 *
 */
export default function QueryKeyboardHints() {
  return (
    <div className="oqb__hints">
      {[
        ['Click / Focus', 'Open field picker'],
        ['Tab', 'Auto-select when 1 match'],
        ['Enter', 'Commit value'],
        ['Backspace', 'Step back / remove last filter'],
        ['Escape', 'Close picker'],
      ].map(([shortcut, description]) => (
        <div key={shortcut} className="oqb__hint-row">
          <kbd>{shortcut}</kbd>
          <span>{description}</span>
        </div>
      ))}
    </div>
  );
}
