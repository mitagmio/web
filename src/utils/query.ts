const queryString = new Proxy(new URLSearchParams(globalThis.location?.search), {
  // @ts-ignore
  get: (searchParams, prop) => searchParams.get(prop),
});


export const getAuthDataFromUrl = () => {
  // @ts-ignore
  const authToken = queryString['authToken']
  // @ts-ignore

  return {
      authToken,
  }
}
