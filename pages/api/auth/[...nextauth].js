import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { identityProvider } from "../../../lib/identityProvider";
import { serviceProvider } from "../../../lib/serviceProvider";

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
          console.log(user);
          return user;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
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
