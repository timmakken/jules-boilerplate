import Image from 'next/image';
import Head from 'next/head'; // Import Head
import type { Metadata } from 'next';

// Page-specific metadata
export const metadata: Metadata = {
  title: "AI Video Generation Platform | Create Stunning Videos with Videogen.ai",
  description: "Effortlessly create professional videos with Videogen.ai, your AI-powered video generation platform. Transform text to video, use customizable templates, and more. Sign up free!",
  keywords: ["AI video generation", "text to video", "video automation", "marketing videos", "videogen.ai", "AI video creator", "easy video creation"],
};

export default function LandingPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Videogen.ai",
    "url": "https://videogen.ai", // TODO: Replace with actual domain in production
    "logo": "https://videogen.ai/logo.png", // TODO: Replace with actual logo URL in production
    "sameAs": [
      // Add social media links if available, e.g.:
      // "https://www.facebook.com/videogenai",
      // "https://www.twitter.com/videogenai",
      // "https://www.linkedin.com/company/videogenai"
    ]
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Videogen.ai Platform",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web-based",
    "offers": {
      "@type": "Offer",
      "price": "0", // For a free tier or free trial
      "priceCurrency": "USD"
    },
    "aggregateRating": { // Optional: Add if you have ratings
      "@type": "AggregateRating",
      "ratingValue": "4.5", // Placeholder
      "reviewCount": "100"  // Placeholder
    },
    "description": metadata.description ?? "Create stunning videos with the power of AI using Videogen.ai.", // Fallback for description
    "url": "https://videogen.ai" // TODO: Replace with actual domain in production
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
      </Head>

      {/* Header placeholder: Navigation will be added here later if needed */}
      {/* <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <a href="#" className="text-2xl font-bold">VideoGen.ai</a>
          <div>
            <a href="#features" className="px-4 hover:text-teal-400">Features</a>
            <a href="#how-it-works" className="px-4 hover:text-teal-400">How it Works</a>
            <a href="#use-cases" className="px-4 hover:text-teal-400">Use Cases</a>
            <a href="#testimonials" className="px-4 hover:text-teal-400">Testimonials</a>
            <button type="button" className="ml-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
              Sign Up
            </button>
          </div>
        </nav>
      </header> */}

      <main className="bg-gray-900 text-white">
        {/* Hero Section */}
        <section id="hero" className="py-20 md:py-32">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Text into Stunning AI Videos, Instantly.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Unleash the power of AI video creation. VideoGen.ai helps you produce engaging videos from scripts or ideas in minutes, no complex editing required.
            </p>
            <button
              type="button"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              Create Your First Video for Free
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
              Everything You Need for Effortless AI Video Creation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <article className="bg-gray-700 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-4">
                  <Image src="/file.svg" alt="AI Text-to-Video Conversion Feature Icon" width={64} height={64} className="h-16 w-16 text-teal-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Powerful Text-to-Video</h3>
                <p className="text-gray-300">
                  Convert your scripts, articles, or raw ideas into captivating videos. Our advanced AI handles the visual storytelling.
                </p>
              </article>
              <article className="bg-gray-700 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-4">
                  <Image src="/window.svg" alt="Customizable Video Templates Feature Icon" width={64} height={64} className="h-16 w-16 text-teal-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Customizable Templates</h3>
                <p className="text-gray-300">
                  Start with a wide array of professionally designed templates. Tailor them to your brand and message with ease.
                </p>
              </article>
              <article className="bg-gray-700 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-4">
                  <Image src="/globe.svg" alt="Realistic AI Voice Cloning Feature Icon" width={64} height={64} className="h-16 w-16 text-teal-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Realistic Voice Cloning</h3>
                <p className="text-gray-300">
                  Bring your scripts to life with natural-sounding AI voices, or clone your own voice for a personalized touch.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
              Generate Videos in 3 Simple Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
              <article className="p-6">
                <div className="text-5xl font-bold text-teal-400 mb-4">1</div>
                <h3 className="text-2xl font-semibold mb-3">Input Script or Idea</h3>
                <p className="text-gray-300">
                  Paste your text, upload a document, or simply type a concept. Our AI will understand your content.
                </p>
              </article>
              <article className="p-6">
                <div className="text-5xl font-bold text-teal-400 mb-4">2</div>
                <h3 className="text-2xl font-semibold mb-3">Customize Style & Voice</h3>
                <p className="text-gray-300">
                  Choose from various video styles, pick your AI avatar, select a voice, and add your brand elements.
                </p>
              </article>
              <article className="p-6">
                <div className="text-5xl font-bold text-teal-400 mb-4">3</div>
                <h3 className="text-2xl font-semibold mb-3">Generate & Download</h3>
                <p className="text-gray-300">
                  Click 'Generate', and our AI will craft your video. Preview, make tweaks, and download your masterpiece.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Use Cases/Examples Section */}
        <section id="use-cases" className="py-16 md:py-24 bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
              Perfect for Any Video Project
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <article className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-600 flex items-center justify-center text-gray-400" aria-label="Placeholder image for an AI-generated marketing video example">
                  {/* If this were an Image component: <Image src="/placeholder-marketing.jpg" alt="Example of an AI-generated marketing video" layout="fill" objectFit="cover" /> */}
                  [Video Thumbnail: Marketing Ad]
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">Engaging Marketing Videos</h3>
                  <p className="text-gray-300">
                    Create compelling ads, product demos, and promotional content that converts viewers into customers.
                  </p>
                </div>
              </article>
              <article className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-600 flex items-center justify-center text-gray-400" aria-label="Placeholder image for an AI-generated educational content example">
                  {/* If this were an Image component: <Image src="/placeholder-education.jpg" alt="Example of AI-generated educational content" layout="fill" objectFit="cover" /> */}
                  [Video Thumbnail: Educational Tutorial]
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">Dynamic Educational Content</h3>
                  <p className="text-gray-300">
                    Transform learning materials into captivating video lessons, tutorials, and explainer videos.
                  </p>
                </div>
              </article>
              <article className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-600 flex items-center justify-center text-gray-400" aria-label="Placeholder image for an AI-generated social media story example">
                  {/* If this were an Image component: <Image src="/placeholder-social.jpg" alt="Example of an AI-generated social media story" layout="fill" objectFit="cover" /> */}
                  [Video Thumbnail: Social Media Story]
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">Viral Social Media Stories</h3>
                  <p className="text-gray-300">
                    Produce eye-catching short videos, stories, and reels perfect for TikTok, Instagram, and more.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
              Loved by Creators and Businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <article className="bg-gray-800 p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl mr-4" aria-label="Avatar for Jane Doe">
                    JD
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">Jane Doe</h4>
                    <span className="text-sm text-gray-400">Marketing Manager, TechSolutions Inc.</span>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "VideoGen.ai has revolutionized our content strategy. We're creating high-quality videos in a fraction of the time and cost. The AI video creation tools are incredibly intuitive!"
                </p>
              </article>
              <article className="bg-gray-800 p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xl mr-4" aria-label="Avatar for Mark Smith">
                    MS
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">Mark Smith</h4>
                    <span className="text-sm text-gray-400">Online Course Creator</span>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "As a solo creator, VideoGen.ai is a game-changer. The customizable templates and text-to-video features save me hours, allowing me to focus on creating great educational content."
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* Footer is already in layout.tsx, so no duplicate here.
          If this page needed a unique footer, it would go here.
          However, the previous step correctly placed the site-wide footer in layout.tsx.
      */}
    </>
  );
}
