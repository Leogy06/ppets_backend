export default function defaultError(generalError: string, error: any) {
  return `\x1b[31m\x1b[1m✖ ${generalError} -  ${error}`;
}
