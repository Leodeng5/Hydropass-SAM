const addCorsHeader = (handler) => {
  return async (event) => {
    const response = await handler(event);
    if (!response.headers) response.headers = {};
    response.headers["Access-Control-Allow-Origin"] = "*";
    return response;
  };
};

export default addCorsHeader;
