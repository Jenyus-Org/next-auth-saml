import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Login.module.css";

export default function Login() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next-Auth SAML Example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Login</h1>

        <div className={styles.grid}>
          <Link href="/api/auth/login/saml">
            <a className={styles.card}>
              <Image height={32} width={64} src="/ssplogo-fish-only.jpg" />
              Login with SimpleSAMLPHP
            </a>
          </Link>
        </div>
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
