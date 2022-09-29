function setErrorRequire(arr) {
  return arr.reduce((acc, curr) => {
    const value = Object.values(curr)[0];
    const result = Object.entries(value).flatMap((item) => item);

    if (!result[1]) {
      acc[result[0]] = curr[1];
    }

    return acc;
  }, {});
}

module.exports = { setErrorRequire };
