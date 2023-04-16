import { CognitoJwtVerifier } from "aws-jwt-verify";

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: "us-west-2_QRqOkURsM",
  tokenUse: "access",
  clientId: "68sghuhe1hl8q2hq7cpgdvs2cd",
});

export default jwtVerifier;
