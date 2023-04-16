export const rootFunction = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `root only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  var items = {
    message: "Welcome to the Hydropass API!",
  };

  const response = {
    statusCode: 200,
    body: JSON.stringify(items),
  };

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
