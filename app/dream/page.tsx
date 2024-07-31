"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // import useRouter
import DropDown from "../../components/DropDown";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import ResizablePanel from "../../components/ResizablePanel";
import { styleType, durationType, themes, rooms } from "../../utils/dropdownTypes";
import LoadingDots from "../../components/LoadingDots";
import { PencilIcon } from "@heroicons/react/24/outline";  // Updated import path for Heroicons v2

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
      setScript(data.scenes.join("\n") || ""); // Join scenes into a single string with new lines
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
    setScript(e.target.innerText);
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
              <div className="space-y-4 w-full max-w-sm">
                <div className="flex mt-3 items-center space-x-3">
                  <p className="text-left font-medium">Duration</p>
                </div>
                <DropDown
                  theme={theme}
                  setTheme={(newTheme) => setTheme(newTheme as typeof theme)}
                  themes={themes}
                />
              </div>
              <div className="space-y-4 w-full max-w-sm">
                <div className="flex mt-10 items-center space-x-3">
                  <p className="text-left font-medium">Visual Style</p>
                </div>
                <DropDown
                  theme={room}
                  setTheme={(newRoom) => setRoom(newRoom as typeof room)}
                  themes={rooms}
                />
              </div>
              <div className="mb-10 w-full max-w-sm">
                <div className="flex mt-6 w-96 items-center space-x-3"></div>
                <div className="flex justify-center mt-6">
                  <form onSubmit={handleSubmit} className="w-full max-w-xl flex justify-center animate-fade-in">
                    <button
                      type="submit"
                      className="generate-button bg-gray-600 text-white font-medium px-5 py-3 rounded-2xl transition-colors transition-transform duration-300 ease-in-out transform hover:bg-gray-500 hover:scale-105"
                    >
                      {loading ? <LoadingDots color="white" style="large" /> : "Generate Video Script"}
                    </button>
                  </form>
                </div>
              </div>
              {showResult && (
                <>
                  <div
                    className="mt-6 text-left w-full max-w-lg py-6 px-12 bg-gray-700 rounded-lg transform transition-all duration-300 relative"
                  >  {/* Container for the script with max-w-lg */}
                    <div className="absolute top-4 right-4 flex items-center text-white p-1 rounded-full">
                      <PencilIcon className="h-4 w-4" />
                    </div>
                    <div
                      ref={contentRef}
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full bg-transparent border border-transparent text-white whitespace-pre-line focus:outline-none resize-none overflow-hidden"
                      onInput={handleScriptChange}
                      style={{ minHeight: '4rem' }} // Ensure it has a minimum height
                    >
                      {script}
                    </div>
                  </div>
                  <div className="flex justify-center mt-14 mb-20">
                    <button
                      onClick={handleContinue}
                      className="generate-button bg-gray-600 text-white font-medium px-5 py-3 rounded-2xl transition-colors transition-transform duration-300 ease-in-out transform hover:bg-gray-500 hover:scale-105"
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
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Yes
                </button>
                <button
                  onClick={cancelContinue}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-300"
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