import Navbar from "./components/navbar";
import Home from "./pages/home";
import About from "./components/about";
import Catalog from "./components/catalog";
import Banner from "./components/banner";
import Footer from "./components/footer";

function App() {
  return (
    <>
      <Navbar />
      <Home />
      <About />
      <Catalog />
      <Banner />
      <Footer />
    </>
  );
}

export default App;
