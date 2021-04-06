# Next-Auth.js SAML Example

![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v3-informational?style=flat&logo=docker)
![Docker Compose](https://img.shields.io/badge/Next.js-10.1-black?style=flat&logo=next.js)

A sample application using Next-Auth.js to authenticate with SAML IdPs.

## What this Sample Includes

The repository includes a Docker-Compose file that spins up the Next.js app in dev mode, alongside a mock IdP using the [`kristophjunge/test-saml-idp`](https://hub.docker.com/r/kristophjunge/test-saml-idp/) image.

The mock IdP will be exposed under http://localhost:8080/simplesaml and our Next.js application under http://localhost:3000.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [NodeJS](https://nodejs.org/en/download/)
- [OpenSSL](https://www.openssl.org/source/)

## Setup

### Generating Certificates with OpenSSL

In order to setup our service provider, we need to generate some SP keys, we can do so using OpenSSL:

```bash
openssl req -x509 -newkey rsa:4096 -keyout certs\key.pem
-out certs\cert.pem -nodes -days 900
```

### Running the Docker Containers

Thanks to Docker-Compose we can launch the entire app using a single command:

```bash
docker-compose up --build
```

Now head to http://localhost:3000 and try logging in. The SAML credentials are `user1` and `user1pass`.

## Customizing

The functionality of this showcase is fairly simple. Due to the fact that Next-Auth.js requires a CSRF token in the authentication callbacks, we need to intercept the SAML assertion before we can pass on the SAML body to our authentication endpoint. We do so in the [`pages/api/auth/login/saml.js`](pages/api/auth/login/saml.js) file:

```js
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
};
```

This generates an HTML form that submits itself as soon as the file is returned, and is mapped to return a `POST` request to the `/api/auth/callback/:provider` route. Here it's important that `:provider` matches the ID of our `Credentials` provider in our Next-Auth.js config.

> **Note:** You can read more about Next-Auth.js's REST API [here](https://next-auth.js.org/getting-started/rest-api).

To initiate the sign-in flow we accept `GET` requests in the same API route handler, and generate a login request URL including our callback URL:

```js
export default async (req, res) => {
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
```

> **Note:** Due to `saml2-js` being callback-based, we use `Promise` to return a redirect or 500 status code to our route handler after generating the URL.

In our Next-Auth.js configuration we include a custom `Credentials` provider that takes the SAML body and uses `saml2-js` to parse it, as well as return the user and add it to our session:

```js
export default NextAuth({
  providers: [
    Providers.Credentials({
      id: "saml",
      name: "SAML",
      authorize: async ({ samlBody }) => {
        samlBody = JSON.parse(decodeURIComponent(samlBody));

        const postAssert = (identityProvider, samlBody) =>
          new Promise((resolve, reject) => {
            serviceProvider.post_assert(
              identityProvider,
              {
                request_body: samlBody,
              },
              (error, response) => {
                if (error) {
                  reject(error);
                }

                resolve(response);
              }
            );
          });

        try {
          const { user } = await postAssert(identityProvider, samlBody);
          return user;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: (token, user) => {
      if (user) {
        return {
          user,
        };
      }

      return token;
    },
    session: (session, { user }) => {
      return {
        ...session,
        user,
      };
    },
  },
});
```

> **Note:** You can read more about the `jwt` and `session` callbacks Next-Auth.js provides [here](https://next-auth.js.org/configuration/callbacks).

## Further Information

- [Setup a Single Sign On SAML Test Environment with Docker and NodeJS | by Jeffry Houser | disney-streaming | Medium](https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9)
- [Support multiple SAML 2 Identity Providers (IDP) · Issue #311 · nextauthjs/next-auth · GitHub](https://github.com/nextauthjs/next-auth/issues/311)

## Motivation

This sample was created to test and showcase the support for SAML in Next-Auth.js. As we can see, due to the requirement of a CSRF token in the `/api/auth/signin/:provider` route we have to manually grab a token and generate a self-submitting `<form>`. This solution has its own trade-offs compared to using a third-party provider like [Osso](https://ossoapp.com/) which has its own [Next-Auth.js provider](https://next-auth.js.org/providers/osso).

## Contributing

This repository is open to pull requests that can enhance the flow! I.e. adding support for multiple IdPs, or finding a better way to support SAML `POST` requests without having to add the CSRF token through a HTML self-submitting `<form>`.
