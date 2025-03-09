import Link from "next/link";

const Home = () => {
  return (
    <div className="py-12">
      <main className="flex flex-col items-center gap-6 px-12 py-24 text-center text-lg font-bold">
        <Link href="/blog/index" className="underline">
          Blog
        </Link>
        <Link href="/fleeting-notes/index" className="underline">
          Fleeting Notes
        </Link>
        <Link href="/reference-notes/index" className="underline">
          Reference Notes
        </Link>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        FOOTER AREA
      </footer>
    </div>
  );
};

export default Home;
