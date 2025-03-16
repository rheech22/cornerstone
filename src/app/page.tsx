import Link from "next/link";

const Home = () => {
  return (
    <div className="h-screen flex flex-col">
      <main className="h-full flex flex-col">
        <nav className="m-auto border-4 border-black flex flex-col items-center gap-12 text-4xl font-bold p-14">
          <div className="text-4xl font-bold border-2 border-black">beta</div>
          <Link
            href="/blog/index"
            className="underline w-full text-start hover:underline-offset-4"
          >
            Blog
          </Link>
          <Link
            href="/fleeting-notes/index"
            className="underline w-full text-end hover:underline-offset-4"
          >
            Fleeting Notes
          </Link>
          <Link
            href="/reference-notes/index"
            className="underline w-full text-start hover:underline-offset-4"
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
