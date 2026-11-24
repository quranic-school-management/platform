/** Labelled form control with an inline error message. `as` can be 'input' (default) or 'select'. */
export default function Field({ label, id, error, as: Tag = 'input', className = '', children, ...rest }) {
  return (
    <div className={`relative ${error ? 'field-error' : ''} ${className}`.trim()}>
      <label
        htmlFor={id}
        className="absolute start-3 top-1 text-xs font-medium text-muted"
      >
        {label}
      </label>
      <Tag
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className="w-full h-[3.25rem] pt-5 pb-1 px-3 bg-paper-elevated border border-muted rounded-pill text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
        {...rest}
      >
        {children}
      </Tag>
      {error && (
        <small
          id={`${id}-err`}
          className="block text-danger text-[0.8125rem] mt-1"
          role="alert"
        >
          {error}
        </small>
      )}
    </div>
  );
}
