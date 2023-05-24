export const AuthFunction = async (event) => {
  const headers = event.headers;

  const tmp = event.methodArn.split(":");
  const apiGatewayArnTmp = tmp[5].split("/");
  const awsAccountId = tmp[4];
  const region = tmp[3];
  const [restApiId, stage, method] = apiGatewayArnTmp;

  let resource = "/"; // root resource
  if (apiGatewayArnTmp[3]) {
    resource += apiGatewayArnTmp[3];
  }

  console.log("Request details: ", {
    restApiId,
    stage,
    method,
    region,
    awsAccountId,
    resource,
  });

  callback(null, generateAllow("me", event.methodArn));
};
