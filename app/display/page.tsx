"use client"; // Add this line to specify that this is a client-side component

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import { AiOutlineReload } from "react-icons/ai";
import Confetti from "react-confetti";

export default function DisplayPage() {
  const searchParams = useSearchParams();
  const script = searchParams.get("script") || "No script provided";
  const styleType = searchParams.get("styleType") || "No style type provided";

  const [loadingScenes, setLoadingScenes] = useState(false);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [movieGenerated, setMovieGenerated] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [fullNarrationFile, setFullNarrationFile] = useState("");
  const [musicFilePath, setMusicFilePath] = useState("");
  const [sceneDurations, setSceneDurations] = useState([]);
  const [narrationScript, setNarrationScript] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRegenConfirmation, setShowRegenConfirmation] = useState(false);
  const [regenIndex, setRegenIndex] = useState(null);
  const [loadingVideoIndex, setLoadingVideoIndex] = useState(null);

  useEffect(() => {
    handleShowVideos();
  }, []);

  const handleShowVideos = async () => {
    setLoadingScenes(true);
    try {
      const response = await fetch('/api/generate-scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: script, style: styleType }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenes');
      }

      const data = await response.json();
      setVideos(data.videoPaths);
      setFullNarrationFile(data.fullNarrationFile);
      setMusicFilePath(data.musicFilePath);
      setSceneDurations(data.sceneDurations);
      setNarrationScript(data.narrationScript);
    } catch (error) {
      console.error('Error generating scenes:', error);
    } finally {
      setLoadingScenes(false);
    }
  };

  const handleReGenerate = (index) => {
    setRegenIndex(index);
    setShowRegenConfirmation(true);
  };

  const confirmReGenerate = async () => {
    if (regenIndex === null) return;

    const duration = sceneDurations[regenIndex];
    const sceneDescription = narrationScript[regenIndex];

    setShowRegenConfirmation(false);
    setLoadingVideoIndex(regenIndex);

    try {
      const videoName = `gen_video_${regenIndex}_0000.mp4`;
      await fetch(`/api/delete-video?file=${videoName}`, { method: 'DELETE' });

      const response = await fetch('/api/regenerate-scene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index: regenIndex, duration, sceneDescription, style: styleType }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate scene');
      }

      const data = await response.json();
      const newVideoPath = data.newVideoPath;

      setVideos(prevVideos => {
        const updatedVideos = [...prevVideos];
        updatedVideos[regenIndex] = newVideoPath;
        return updatedVideos;
      });
    } catch (error) {
      console.error('Error regenerating scene:', error);
    } finally {
      setLoadingVideoIndex(null);
    }
  };

  const cancelReGenerate = () => {
    setShowRegenConfirmation(false);
    setRegenIndex(null);
  };

  const handleGenerateMovie = async () => {
    setShowConfirmation(true);
  };

  const confirmGenerateMovie = async () => {
    setLoadingMovie(true);
    setShowConfirmation(false);
    try {
      const response = await fetch('/api/generate-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          narrationScript,
          sceneDurations,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate movie');
      }

      const videoBlob = await response.blob();
      const videoObjectUrl = URL.createObjectURL(videoBlob);
      setVideoUrl(videoObjectUrl);
      setMovieGenerated(true);
    } catch (error) {
      console.error('Error generating movie:', error);
    } finally {
      setLoadingMovie(false);
    }
  };

  const cancelGenerateMovie = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="relative w-full min-h-screen font-quicksand bg-light-gray overflow-hidden">
      <Header className="fixed top-0 left-0 w-full z-30" />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-4 pt-20 pb-20 w-full overflow-y-auto"
      >
        {loadingScenes ? (
          <p className="text-white text-xl">Generating Scenes...</p>
        ) : (
          <div className="space-y-4 w-full max-w-5xl py-6 px-12 rounded-lg transform transition-all duration-300 relative text-white">
            {videos.length > 0 && (
              <div className="w-full mt-4 mb-8 overflow-x-auto">
                <div className="flex space-x-4">
                  {videos.map((video, index) => (
                    <div key={index} className="flex-shrink-0 text-center">
                      {loadingVideoIndex === index ? (
                        <div className="flex flex-col items-center">
                          <p className="text-white text-xl">Regenerating Scene...</p>
                          <div className="loader mt-2"></div>
                        </div>
                      ) : (
                        <>
                          <video key={video} controlsList="nodownload" controls width="500px">
                            <source src={video} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <div className="flex items-center justify-center mt-2">
                            <span className="text-sm">Scene {index + 1}</span>
                            <button
                              onClick={() => handleReGenerate(index)}
                              className="bg-gray-600 text-white font-medium ml-2 px-1 py-1 rounded-full transition-colors transition-transform duration-300 ease-in-out transform hover:bg-gray-500 hover:scale-105"
                              disabled={loadingScenes || loadingMovie}
                            >
                              <AiOutlineReload size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {movieGenerated ? (
              <>
                <Confetti />
                <p className="font-quicksand text-5xl font-bold tracking-tight text-gray-300 sm:text-5xl">Your movie is done!</p>
              </>
            ) : (
              <button
                onClick={handleGenerateMovie}
                className="bg-gray-600 text-white font-medium px-5 py-3 rounded-2xl transition-colors transition-transform duration-300 ease-in-out text-1xl transform hover:bg-gray-500 hover:scale-105"
                disabled={loadingMovie}
              >
                {loadingMovie ? 'Generating Movie...' : 'Create Movie'}
              </button>
            )}
            {videoUrl && (
              <div className="mt-8">
                <video controls width="100%">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <a href={videoUrl} download="output_video.mp4" className="mt-4 inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500">
                  Download Video
                </a>
              </div>
            )}
          </div>
        )}
      </motion.main>

      {/* Confirmation Modal for Movie */}
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
              <p className="text-white">Are you sure these are the scenes you want?</p>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={confirmGenerateMovie}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Yes
                </button>
                <button
                  onClick={cancelGenerateMovie}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Confirmation Modal for Regenerate */}
      {showRegenConfirmation && (
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
              <p className="text-white">Do you want to regenerate the video for this scene?</p>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={confirmReGenerate}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Yes
                </button>
                <button
                  onClick={cancelReGenerate}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      <style jsx>{`
        .loader {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #ffffff;
          animation: spin 1s ease infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
