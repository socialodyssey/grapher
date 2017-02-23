export function sortAlphabetize(key) {
  return (a, b) => {
    return b[key] < a[key] ? 1 : -1;
  }
}

export function mapSelect(key) {
  return el => el[key];
}
