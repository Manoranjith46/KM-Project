/**
 * Reusable form error display component
 * Clicking on the error message focuses the associated input field
 */

const FormFieldError = ({ error, onFocus }) => {
  if (!error) return null;

  return (
    <span
      className="form-field-error"
      onClick={onFocus}
      role="alert"
      aria-live="polite"
    >
      {error}
    </span>
  );
};

const FormErrorBox = ({ error }) => {
  if (!error) return null;

  return (
    <div className="form-error-box" role="alert" aria-live="assertive">
      {error}
    </div>
  );
};

export { FormFieldError, FormErrorBox };
export default FormFieldError;
