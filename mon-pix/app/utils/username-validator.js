export default function isUsernameValid(username) {
  if (!username) {
    return false;
  }
  // From http://stackoverflow.com/a/46181/5430854
  // eslint-disable-next-line no-useless-escape
  const pattern = /^([a-z]+[.]+[a-z]+[0-9]{4})(?!@)/;
  return pattern.test(username.trim());
}
