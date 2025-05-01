import Link from "next/link";

const Home = () => {
  return (
    <div className="h-screen flex flex-col">
      <main className="h-full flex flex-col">
        <nav className="relative m-auto flex flex-col items-center gap-12 text-4xl font-bold p-14 flowing-border">
          <p className="text-center text-2xl font-bold">
            Hello! This place is still in development.
          </p>
          <Link
            href="/blog"
            className="underline w-full text-start hover:underline-offset-4"
          >
            Blog
          </Link>
          <Link
            href="/note"
            className="underline w-full hover:underline-offset-4 text-end"
          >
            Note
          </Link>
          <p className="text-center text-2xl font-bold">
            The official version wiil be released soon :)
          </p>
        </nav>
      </main>
    </div>
  );
};

export default Home;
