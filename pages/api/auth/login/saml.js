import axios from "axios";
import { identityProvider } from "../../../../lib/identityProvider";
import { serviceProvider } from "../../../../lib/serviceProvider";

export default async (req, res) => {
  if (req.method === "POST") {
    const { data, headers } = await axios.get("/api/auth/csrf", {
      baseURL: "http://localhost:3000",
    });
    const { csrfToken } = data;

    const encodedSAMLBody = encodeURIComponent(JSON.stringify(req.body));

    res.setHeader("set-cookie", headers["set-cookie"] ?? "");
    return res.send(
      `<html>
        <body>
          <form action="/api/auth/callback/saml" method="POST">
            <input type="hidden" name="csrfToken" value="${csrfToken}"/>
            <input type="hidden" name="samlBody" value="${encodedSAMLBody}"/>
          </form>
          <script>
            document.forms[0].submit();
          </script>
        </body>
      </html>`
    );
  }

  const createLoginRequestUrl = (identityProvider, options = {}) =>
    new Promise((resolve, reject) => {
      serviceProvider.create_login_request_url(
        identityProvider,
        options,
        (error, loginUrl) => {
          if (error) {
            reject(error);
          }
          resolve(loginUrl);
        }
      );
    });

  try {
    const loginUrl = await createLoginRequestUrl(identityProvider);
    return res.redirect(loginUrl);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};
