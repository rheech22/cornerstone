import { Fonts } from "./components/fonts";

const Home = () => {
  return (
    <div className="">
      <main className="flex flex-col items-center">
        <Fonts />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        FOOTER
      </footer>
    </div>
  );
};

export default Home;
