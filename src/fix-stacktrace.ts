const customErrorPrepareStackTrace = ((error, stack) => {
  Error.prepareStackTrace = ErrorPrepareStackTrace;
  error.stack = error.stack;
  Error.prepareStackTrace = customErrorPrepareStackTrace;
  error.stack = error.stack!.replaceAll(
    /data:\S{70,}/g,
    (match: string) => match.slice(0, 70) + "..."
  );
  return error.stack;
}) satisfies typeof Error.prepareStackTrace;
const ErrorPrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = customErrorPrepareStackTrace;
