const customErrorPrepareStackTrace = ((error, stack) => {
  Error.prepareStackTrace = ErrorPrepareStackTrace;
  Error.captureStackTrace(error, customErrorPrepareStackTrace);
  Error.prepareStackTrace = customErrorPrepareStackTrace;
  error.stack = error.stack!.replaceAll(
    /data:\S{30,}/g,
    (match) => match.slice(0, 30) + "..."
  );
  return error.stack;
}) satisfies typeof Error.prepareStackTrace;
const ErrorPrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = customErrorPrepareStackTrace;
