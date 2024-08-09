"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // import useRouter
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import ResizablePanel from "../../components/ResizablePanel";
import { styleType, durationType, themes, styles } from "../../utils/dropdownTypes";
import LoadingDots from "../../components/LoadingDots";
import { PencilIcon } from "@heroicons/react/24/outline";  // Updated import path for Heroicons v2

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function DreamPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState<durationType>("Tiktok (~ 30 sec)");
  const [room, setRoom] = useState<styleType>("Cartoony");
  const [showResult, setShowResult] = useState(false);
  const [url, setUrl] = useState("");
  const [script, setScript] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const contentRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter(); // initialize router
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setUrl(urlParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResult(false);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, duration: theme }),
      });

      const data = await response.json();
      const scriptText = data.scenes.join("\n") || "";
      setScript(scriptText);
      setCharCount(scriptText.length);
      setShowResult(true);
    } catch (error) {
      setError("Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  const handleScriptChange = (e) => {
    const selection = window.getSelection();
    const cursorPosition = selection.getRangeAt(0).startOffset;
    const updatedScript = e.target.innerText;
    setScript(updatedScript);
    setCharCount(updatedScript.length);
    // Reset cursor position
    setTimeout(() => {
      const range = document.createRange();
      range.setStart(contentRef.current.childNodes[0], cursorPosition);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 0);
  };

  const handleContinue = () => {
    setShowConfirmation(true);
  };

  const confirmContinue = () => {
    setShowConfirmation(false);
    router.push(`/display?script=${encodeURIComponent(script)}&styleType=${encodeURIComponent(room)}`); // navigate to new page
  };

  const cancelContinue = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [script]);

  useEffect(() => {
    if (contentRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [showResult]);

  const estimatedDuration = (charCount * 0.06).toFixed(2); // Assume 0.06 seconds per character

  return (
    <div className="relative w-full min-h-screen font-quicksand bg-light-gray overflow-hidden">
      <Header className="fixed top-0 left-0 w-full z-30" /> {/* Ensure header is at the top */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-4 pt-20 pb-20 w-full overflow-y-auto"> {/* Adjust padding to compensate for header */}
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div
              className="flex justify-between items-center w-full flex-col mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-4 w-full max-w-6xl">
                <div className="flex mt-3 items-center space-x-3">
                  <p className="text-left text-2xl font-bold">Duration</p>
                </div>
                <div className="flex justify-between w-full space-x-4">
                  <div
                    onClick={() => setTheme("Tiktok (~ 30 sec)")}
                    className={`flex-grow p-8 h-[calc(100%-2rem)] rounded-lg cursor-pointer transition transform hover:scale-105 ${
                      theme === "Tiktok (~ 30 sec)"
                        ? "bg-indigo-600 text-white"
                        : "bg-[rgb(20,20,20)] text-white"
                    }`}
                  >
                    <h3 className="text-2xl font-bold mb-4">Tiktok ~30 sec</h3>
                    <p className="text-sm mb-6">Quick, engaging shorts.</p>
                    <video
                      className="w-full h-auto aspect-w-16 aspect-h-9 rounded-lg"
                      src="/_demo_vids/sample_movie_1.mp4"
                      controls
                    ></video>
                  </div>
                  <div
                    onClick={() => setTheme("Long (~ 1:00 min)")}
                    className={`flex-grow p-8 h-[calc(100%-2rem)] rounded-lg cursor-pointer transition transform hover:scale-105 ${
                      theme === "Long (~ 1:00 min)"
                        ? "bg-indigo-600 text-white"
                        : "bg-[rgb(20,20,20)] text-white"
                    }`}
                  >
                    <h3 className="text-2xl font-bold mb-4">Long Video ~ 1:00 min</h3>
                    <p className="text-sm mb-6">More detailed and informative videos.</p>
                    <video
                      className="w-full h-auto aspect-w-16 aspect-h-9 rounded-lg"
                      src="/_demo_vids/sample_movie_2.mp4"
                      controls
                    ></video>
                  </div>
                </div>
              </div>
              <div className="space-y-4 w-full max-w-6xl">
                <div className="flex mt-10 items-center space-x-3">
                  <p className="text-left text-2xl font-bold">Visual Style</p>
                </div>
                <div className="flex justify-between w-full space-x-4">
                  <div
                    onClick={() => setRoom("Cartoony")}
                    className={`flex-grow p-8 h-[calc(100%-2rem)] rounded-lg cursor-pointer transition transform hover:scale-105 ${
                      room === "Cartoony"
                        ? "bg-indigo-600 text-white"
                        : "bg-[rgb(20,20,20)] text-white"
                    }`}
                  >
                    <h3 className="text-2xl font-bold mb-4">Cartoony</h3>
                    <Swiper
                      style={{ maxWidth: '500px', maxHeight: '300px' }}
                      spaceBetween={10}
                      slidesPerView={2.5}
                      loop={true}
                    >
                      <SwiperSlide><img src="/_cartoony_examples/ex_1.png" alt="Example 1" className="rounded-lg" /></SwiperSlide>
                      <SwiperSlide><img src="/_cartoony_examples/ex_2.png" alt="Example 2" className="rounded-lg" /></SwiperSlide>
                      <SwiperSlide><img src="/_cartoony_examples/ex_3.png" alt="Example 3" className="rounded-lg" /></SwiperSlide>
                      <SwiperSlide><img src="/_cartoony_examples/ex_4.png" alt="Example 4" className="rounded-lg" /></SwiperSlide>
                    </Swiper>
                  </div>
                  <div
                    onClick={() => setRoom("Realistic")}
                    className={`flex-grow p-8 h-[calc(100%-2rem)] rounded-lg cursor-pointer transition transform hover:scale-105 ${
                      room === "Realistic"
                        ? "bg-indigo-600 text-white"
                        : "bg-[rgb(20,20,20)] text-white"
                    }`}
                  >
                    <h3 className="text-2xl font-bold mb-4">Realistic</h3>
                    <Swiper
                      style={{ maxWidth: '500px', maxHeight: '300px' }}
                      spaceBetween={10}
                      slidesPerView={2.5}
                      loop={true}
                    >
                      <SwiperSlide><img src="/_realistic_examples/ex_1.png" alt="Example 1" className="rounded-lg" /></SwiperSlide>
                      <SwiperSlide><img src="/_realistic_examples/ex_2.png" alt="Example 2" className="rounded-lg" /></SwiperSlide>
                      <SwiperSlide><img src="/_realistic_examples/ex_3.png" alt="Example 3" className="rounded-lg" /></SwiperSlide>
                      <SwiperSlide><img src="/_realistic_examples/ex_4.png" alt="Example 4" className="rounded-lg" /></SwiperSlide>
                    </Swiper>
                  </div>
                </div>
              </div>
              <div className="mb-10 w-full max-w-sm">
                <div className="flex mt-6 w-96 items-center space-x-3"></div>
                <div className="flex justify-center mt-6">
                  <form onSubmit={handleSubmit} className="w-full max-w-xl flex justify-center animate-fade-in">
                    <button
                      type="submit"
                      className="generate-button bg-indigo-600 text-white font-medium px-5 py-3 rounded-2xl transition-colors transition-transform duration-300 ease-in-out transform hover:bg-indigo-500 hover:scale-105"
                    >
                      {loading ? <LoadingDots color="white" style="large" /> : "Generate Video Script"}
                    </button>
                  </form>
                </div>
              </div>
              {showResult && (
                <>
                  <div className="mt-6 text-left w-full max-w-lg">
                    <h2 className="text-2xl font-bold text-white">Movie Script</h2>
                    <p className="text-sm text-gray-300 mb-4">A narrator will voice over this script.</p>
                  </div>
                  <div
                    className="text-left w-full max-w-lg py-6 px-12 bg-indigo-200 rounded-lg transform transition-all duration-300 relative"
                  >  {/* Container for the script with max-w-lg */}
                    <div className="absolute top-4 right-4 flex items-center text-black p-1 rounded-full">
                      <PencilIcon className="h-4 w-4" />
                    </div>
                    <div
                      ref={contentRef}
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full bg-transparent border border-transparent text-black whitespace-pre-line focus:outline-none resize-none overflow-hidden"
                      onInput={handleScriptChange}
                      style={{ minHeight: '4rem', lineHeight: '2.5' }} // Ensure it has a minimum height and increased line height
                    >
                      {script}
                    </div>
                  </div>
                  <div className="flex justify-end mt-2 text-sm text-gray-400 w-full max-w-lg">
                    <div className="text-right">
                      <p>{charCount} characters</p>
                      <p>Estimated duration: {estimatedDuration} seconds</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-14 mb-14">
                    <button
                      onClick={handleContinue}
                      className="generate-button bg-indigo-600 text-white font-medium px-5 py-3 rounded-2xl transition-colors transition-transform duration-300 ease-in-out transform hover:bg-indigo-500 hover:scale-105"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {error && <p className="text-red-500">{error}</p>}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-[rgba(0,0,0,0.9)] p-6 rounded-lg shadow-lg text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white">Are you sure? You cannot change your script after this.</p>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={confirmContinue}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500"
                >
                  Yes
                </button>
                <button
                  onClick={cancelContinue}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      {/* <Footer /> */}
    </div>
  );
}
