import { getSession, signIn, signOut } from "next-auth/client";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home({ session }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next-Auth SAML Example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Next-Auth.js SAML Example!</h1>

        <br />

        <p className={styles.description}>
          Welcome back {session.user.attributes.email}
        </p>

        <div className={styles.grid}>
          <button
            onClick={() => {
              signOut();
              signIn();
            }}
            className={styles.card}
          >
            <h3>Log Out</h3>
          </button>
        </div>

        <h3>User Information</h3>
        <pre className={styles.code}>
          <code>
            {JSON.stringify(
              (({ attributes, ...info }) => info)(session.user),
              null,
              2
            )}
          </code>
        </pre>

        <h3>User Attributes</h3>
        <pre className={styles.code}>
          <code>{JSON.stringify(session.user.attributes, null, 2)}</code>
        </pre>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/jenyus.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: `/login?callbackUrl=${context.resolvedUrl}`,
      },
    };
  }

  return {
    props: { session },
  };
};
