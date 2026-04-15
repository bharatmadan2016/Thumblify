import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import LenisScroll from "./components/LenisScroll";
import Generate from "./pages/Generate";
import MyGeneration from "./pages/MyGeneration";
import YtPreview from "./pages/YtPreview";
import Login from "./components/Login";
import Community from "./pages/Community";


export default function App() {
    return (
        <>
            <LenisScroll />
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                 <Route path="/generate" element={<Generate />} />
                 <Route path="/generate/:id" element={<Generate />} />
                 <Route path="/community" element={<Community />} />
                 <Route path="/my-generation" element={<MyGeneration />} />
                 <Route path="/preview" element={<YtPreview />} />
                 <Route path="/login" element={<Login />} />
                 
            </Routes>
            <Footer />
        </>
    );
}