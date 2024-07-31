"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dream?url=${url}`);
  };

  return (
    <div className="font-quicksand bg-light-gray">
      <div className="relative w-full h-[93vh] flex flex-col items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/bg_video.mp4" // Ensure your video path is correct
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <div className="absolute inset-0 bg-black opacity-40"></div> {/* Optional: Add an overlay for better text contrast */}
        <div className="relative z-10 flex w-full h-full flex-col items-center justify-center animate-fade-in">
          <Header className="animate-fade-in" />
          <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-0 mb-20 mt-0 background-gradient animate-fade-in">
            <h1 className="mx-auto max-w-3xl font-quicksand text-5xl font-medium tracking-tight text-gray-300 sm:text-7xl mb-6 text-shadow-2xl animate-fade-in">
              Generate a{" "}
              <span className="relative whitespace-nowrap text-blue-600 text-shadow-2xl">
                {/* <SquigglyLines />
                <span className="relative">video</span> */}
              </span>{" "}
              video from a URL using AI.
            </h1>

            <form onSubmit={handleSubmit} className="w-full max-w-xl mt-8 flex animate-fade-in">
              <input
                type="text"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input-url flex-grow px-6 py-3 rounded-l-2xl"
                required
              />
              <button
                type="submit"
                className="generate-button bg-gray-600 text-white font-medium px-5 py-3 rounded-r-2xl -ml-0"
              >
                Generate
              </button>
            </form>
          </main>
          {/* <Footer /> */}
        </div>
      </div>

      <div className="relative bg-dark-gray text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-light-gray text-black rounded-xl p-8 w-11/12 md:w-3/4 lg:w-2/3 shadow-lg z-20">
            <div className="text-center mt-4">
              <h2 className="text-4xl font-bold mb-8">Just 4 Steps!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-light-gray text-black rounded-xl p-8 shadow-lg">Placeholder 1</div>
                <div className="bg-light-gray text-black rounded-xl p-8 shadow-lg">Placeholder 2</div>
                <div className="bg-light-gray text-black rounded-xl p-8 shadow-lg">Placeholder 3</div>
                <div className="bg-light-gray text-black rounded-xl p-8 shadow-lg">Placeholder 4</div>
                <div className="bg-light-gray text-black rounded-xl p-8 shadow-lg">Placeholder 5</div>
                <div className="bg-light-gray text-black rounded-xl p-8 shadow-lg">Placeholder 6</div>
              </div>
            </div>
          </div>
          {/* <h2 className="text-3xl font-bold mb-8">Steps to Generate Your Video</h2>
          <ol className="list-decimal list-inside space-y-4">
            <li>Enter the URL of the content you want to generate a video from.</li>
            <li>Click the "Generate Video" button.</li>
            <li>Wait for the processing to complete.</li>
            <li>Download and enjoy your generated video.</li>
          </ol> */}
        </div>
      </div>

      <div className="gradient-bg text-white py-40">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8"></h2>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 1.5s ease-out forwards;
        }

        .input-url {
          border: 0px solid transparent; /* Ensure a border is present to see the color change */
          background-color: rgba(26, 26, 26, 0.8); /* Dark background color with transparency */
          color: rgba(240, 240, 240, 0.8); /* Light text color with transparency */
        }
        .input-url::placeholder {
          color: rgba(208, 208, 208, 0.8); /* Lighter placeholder text color with transparency */
        }
        .input-url:focus {
          outline: none;
          border-color: white; /* Set the border color to white on focus */
          box-shadow: none;
          transform: scale(1); /* Prevents the input from getting bigger */
        }
        .generate-button {
          background-color: rgba(160, 160, 160, 0.8); /* Lighter gray color with transparency */
          transition: background-color 0.3s ease, transform 0.3s ease; /* Add transition for smooth effect */
        }
        .generate-button:hover {
          background-color: rgba(200, 200, 200, 0.8); /* Change background color on hover */
          transform: scale(1.05); /* Slightly enlarge button on hover */
        }
        .bg-light-gray {
          background-color: rgb(255,255,255); /* Light gray background color */
        }
        .bg-dark-gray {
          background-color: rgb(200,200,200); /* Dark gray background color */
        }
        .gradient-bg {
          background: linear-gradient(to bottom, rgb(50,50,50) 30%, rgb(255,255,255) 90%);
        }
      `}</style>
    </div>
  );
}
