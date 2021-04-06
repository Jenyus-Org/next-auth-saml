import fs from "fs";
import { IdentityProvider } from "saml2-js";

export const identityProvider = new IdentityProvider({
  sso_login_url: "http://localhost:8080/simplesaml/saml2/idp/SSOService.php",
  certificates: [
    fs.readFileSync("certs/idp_key.pem").toString(),
  ],
});
