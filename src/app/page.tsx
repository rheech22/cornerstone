import Link from "next/link";

const Home = () => {
  return (
    <div className="h-screen flex flex-col">
      <main className="h-full flex">
        <nav className="m-auto border-4 border-black flex flex-col items-center justify-center gap-12 text-4xl font-bold p-14">
          <Link href="/blog/index" className="underline w-full text-center">
            Blog
          </Link>
          <Link
            href="/fleeting-notes/index"
            className="underline w-full text-center"
          >
            Fleeting Notes
          </Link>
          <Link
            href="/reference-notes/index"
            className="underline w-full text-center"
          >
            Reference Notes
          </Link>
        </nav>
      </main>
      <footer className="mx-auto mt-auto pb-12 underline underline-offset-4 font-semibold">
        ©️ copyright 2025 by lch
      </footer>
    </div>
  );
};

export default Home;
