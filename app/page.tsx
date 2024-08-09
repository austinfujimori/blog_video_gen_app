"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Requires CSS file

import Header from "../components/Header";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/dream?url=${url}`);
  };

  const slides = [
    {
      id: 1,
      text: "Generated from this website!",
      url: "https://www.rxbar.com/en_US/real-talk/articles/8-easy-habits-for-a-better-new-year.html",
      video: "/_demo_vids/sample_movie_1.mp4",
    },
    {
      id: 2,
      text: "Generated from this website!",
      url: "https://github.com/Nutlope/roomGPT",
      video: "/_demo_vids/sample_movie_2.mp4",
    },
  ];

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="font-quicksand bg-light-gray min-h-screen flex flex-col">
      <div className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/bg_video.mp4"
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 flex w-full h-full flex-col items-center justify-center animate-fade-in">
          <Header className="animate-fade-in" />
          <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-0 mb-20 mt-0 background-gradient animate-fade-in">
            <h1 className="mx-auto max-w-3xl font-quicksand text-5xl font-medium tracking-tight text-gray-300 sm:text-7xl mb-6 text-shadow-2xl animate-fade-in">
              Generate a{" "}
              <span className="relative whitespace-nowrap text-blue-600 text-shadow-2xl">
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
        </div>
      </div>

      <div className="relative text-white pt-20 gradient-bg flex-grow">
        <div className="max-w-6xl mx-auto px-4">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-light-gray text-black rounded-xl p-8 w-full lg:w-8/12 shadow-lg z-20">
            <div className="text-center mt-4">
              <h2 className="text-4xl font-bold pt-4">
                Check out our sample videos!
              </h2>
              <p className="mt-8 mb-12 text-black">
                {slides[currentSlide].text}{" "}
                <a
                  href={slides[currentSlide].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  website!
                </a>
              </p>
              <Carousel
                showThumbs={false}
                showIndicators={true}
                showStatus={false}
                infiniteLoop={true}
                useKeyboardArrows={true}
                autoPlay={false}
                onChange={handleSlideChange}
                className="carousel-center"
              >
                {slides.map((slide) => (
                  <div key={slide.id} className="flex justify-center">
                    <video controls className="w-full">
                      <source src={slide.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
              Just follow 3 steps
            </h2>
            <p className="mt-4 pb-12 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Let AI do the work for you!
            </p>
          </div>
          <div className="mt-12 mb-20 grid grid-cols-1 gap-8">
            <div className="flex flex-col md:flex-row md:justify-center md:space-x-8">
              {/* Step 1 */}
              <div className="relative text-center w-full md:w-1/2 lg:w-1/2">
                <div className="relative">
                  <img
                    src="/_walkthrough_examples/ex_1.png"
                    alt="Step 1"
                    className="mx-auto w-full rounded-lg"
                  />
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">
                  Step 1: Video Options
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Choose your ideal duration and visual style
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center w-full md:w-1/2 lg:w-1/2 mt-8 md:mt-0">
                <div className="relative">
                  <img
                    src="/_walkthrough_examples/ex_2.png"
                    alt="Step 2"
                    className="mx-auto w-full rounded-lg"
                  />
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">
                  Step 2: Script Generation
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  You may also edit the video script
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center w-full lg:w-1/2 mx-auto mt-2">
              <div className="relative">
                <img
                  src="/_walkthrough_examples/ex_3.png"
                  alt="Step 3"
                  className="mx-auto w-full rounded-lg"
                />
              </div>
              <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">
                Step 3: Scene Generation
              </h3>
              <p className="mt-2 text-base text-gray-500">
                You may regenerate a scene if you do not like it
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="gradient-bg-2 py-16 pb-56">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mt-8 text-base font-semibold text-indigo-600 tracking-wide uppercase">
              Behind the Scenes
            </h2>
            <p className="mt-4 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              What Powers Our Videos
            </p>
          </div>
          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-2 md:gap-y-20">
              <div className="relative text-center">
                <dt>
                  <div className="flex items-center justify-center h-40 w-40 mb-4 mx-auto">
                    <img
                      src="/openailogo.png"
                      alt="OpenAI Logo"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">
                    Image Generation
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Using the{" "}
                  <a
                    href="https://openai.com/dall-e-3"
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenAI API's Dall-E 3
                  </a>{" "}
                  for generating stunning and relevant images.
                </dd>
              </div>

              <div className="relative text-center">
                <dt>
                  <div className="flex items-center justify-center h-40 w-40 mb-4 mx-auto">
                    <img
                      src="/meta.png"
                      alt="Meta Logo"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">
                    Text Generation
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Leveraging{" "}
                  <a
                    href="https://github.com/meta-llama/LLaMA"
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LLama 3 (vllm)
                  </a>{" "}
                  on Modal to create engaging and relevant text content.
                </dd>
              </div>

              <div className="relative text-center">
                <dt>
                  <div className="flex items-center justify-center h-40 w-40 mb-4 mx-auto">
                    <img
                      src="/elevenlabs.png"
                      alt="ElevenLabs Logo"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">
                    Narration
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Utilizing the{" "}
                  <a
                    href="https://elevenlabs.io"
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ElevenLabs API
                  </a>{" "}
                  to provide clear and professional narration for videos.
                </dd>
              </div>

              <div className="relative text-center">
                <dt>
                  <div className="flex items-center justify-center h-40 w-40 mb-4 mx-auto">
                    <img
                      src="/replicate.png"
                      alt="Replicate Logo"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">
                    Music Generation
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Generating music using the{" "}
                  <a
                    href="https://replicate.com/meta/musicgen"
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Meta MusicGen
                  </a>{" "}
                  model available on Replicate.
                </dd>
              </div>

              <div className="relative text-center">
                <dt>
                  <div className="flex items-center justify-center h-40 w-40 mb-4 mx-auto">
                    <img
                      src="/opensora.png"
                      alt="Open-Sora Logo"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">
                    Video Generation
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Using{" "}
                  <a
                    href="https://github.com/hpcaitech/Open-Sora"
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open-Sora
                  </a>{" "}
                  to create high-quality, AI-powered video content.
                </dd>
              </div>
            </dl>
          </div>
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
          background-color: rgba(180, 180, 180, 0.8); /* Lighter gray color with transparency */
          transition: background-color 0.3s ease, transform 0.3s ease; /* Add transition for smooth effect */
        }
        .generate-button:hover {
          background-color: rgba(220, 220, 220, 0.8); /* Change background color on hover */
          transform: scale(1.05); /* Slightly enlarge button on hover */
        }
        .bg-light-gray {
          background-color: rgb(255, 255, 255); /* Light gray background color */
        }
        .gradient-bg {
          background: linear-gradient(to bottom, rgb(190, 190, 190) 10%, rgb(255, 255, 255) 100%);
          min-height: 100vh; /* Ensure it extends to the bottom */
        }

        .gradient-bg-2 {
          background: linear-gradient(to bottom, rgb(255, 255, 255) 60%, rgb(200, 200, 200) 100%);
          min-height: 100vh; /* Ensure it extends to the bottom */
        }

        .carousel-center .carousel .slider-wrapper {
          display: flex;
          justify-content: center;
        }

        .carousel-center .carousel .slider-wrapper .slider {
          width: 60%; /* Make the Swiper narrower */
        }

        .carousel-center .carousel .slide video {
          width: 100%; /* Make the video full width */
        }

        img {
          object-fit: contain;
        }

        .steps-container .relative {
          position: relative;
          width: 100%; /* Ensure full width */
          padding-top: 20px; /* Provide space for the number icon */
        }

        .steps-container img {
          max-width: 100%; /* Ensure images take full width */
        }

        .steps-container .absolute-icon {
          position: absolute;
          top: -30px; /* Position the number icon above the image */
          left: 20px; /* Align icon to the left */
          z-index: 10; /* Ensure the icon appears above the image */
        }
      `}</style>
    </div>
  );
}
