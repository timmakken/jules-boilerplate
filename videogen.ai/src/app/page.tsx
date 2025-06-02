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
    "url": "USER_MUST_REPLACE_WITH_ACTUAL_DOMAIN_URL", // TODO: Replace with actual domain in production
    "logo": "USER_MUST_REPLACE_WITH_ACTUAL_LOGO_URL/logo.png", // TODO: Replace with actual logo URL in production
    "sameAs": [
      // USER_MUST_ADD_SOCIAL_MEDIA_LINKS_HERE: e.g.,
      // "https://www.facebook.com/yourpage",
      // "https://www.twitter.com/yourhandle",
      // "https://www.linkedin.com/company/yourcompany"
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
    "aggregateRating": { // Optional: Update with real ratings if available, otherwise remove or keep as illustrative placeholders.
      "@type": "AggregateRating",
      "ratingValue": "4.5", // Illustrative Placeholder
      "reviewCount": "100"  // Illustrative Placeholder
    },
    "description": metadata.description ?? "Create stunning videos with the power of AI using Videogen.ai.", // Fallback for description
    "url": "USER_MUST_REPLACE_WITH_ACTUAL_DOMAIN_URL" // TODO: Replace with actual domain in production for the software application page if different
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

      <main className="bg-background text-foreground">
        {/* Hero Section */}
        <section id="hero" className="relative py-20 md:py-32 overflow-hidden"> {/* Added relative and overflow-hidden */}
          {/* Background Media Placeholder */}
          <div className="absolute inset-0 z-0 bg-neutral-darker opacity-60">
            {/* Placeholder for video/image - styled to be visible */}
            <div className="h-full flex items-center justify-center">
              <span className="text-neutral-lightest text-2xl">(Hero Background Media Placeholder)</span>
            </div>
          </div>
          <div className="container relative z-10 mx-auto px-6 text-center"> {/* Added relative and z-10 */}
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white"> {/* Ensure text is visible on dark bg */}
              Transform Text into Stunning AI Videos, Instantly.
            </h1>
            <p className="text-lg md:text-xl text-neutral-lightest mb-10 max-w-2xl mx-auto"> {/* Ensure text is visible on dark bg */}
              Unleash the power of AI video creation. VideoGen.ai helps you produce engaging videos from scripts or ideas in minutes, no complex editing required.
            </p>
            <button
              type="button"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-300 transform hover:scale-105 z-10" /* Ensure button is above placeholder */
            >
              Create Your First Video for Free
            </button>
          </div>
        </section>
        {/* TODO: For more advanced scroll animations (e.g., staggered, triggered on viewport entry),
            consider a small JS Intersection Observer utility or a lightweight library.
            The current 'animate-fadeInUp' will trigger on page load. */}
        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-neutral-lightest text-neutral-darkest opacity-0 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 md:mb-16">
              Everything You Need for Effortless AI Video Creation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <article className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17.25L14.25 12L9.75 6.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12H3m12.75 0L12 15.75M15.75 12L12 8.25" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h6M3 7.5h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-semibold mb-3">Powerful Text-to-Video</h3>
                <p className="text-neutral-darker">
                  Convert your scripts, articles, or raw ideas into captivating videos. Our advanced AI handles the visual storytelling.
                </p>
              </article>
              <article className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6l3-3 3 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-semibold mb-3">Customizable Templates</h3>
                <p className="text-neutral-darker">
                  Start with a wide array of professionally designed templates. Tailor them to your brand and message with ease.
                </p>
              </article>
              <article className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-semibold mb-3">Realistic Voice Cloning</h3>
                <p className="text-neutral-darker">
                  Bring your scripts to life with natural-sounding AI voices, or clone your own voice for a personalized touch.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 text-neutral-darkest opacity-0 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 md:mb-16">
              Generate Videos in 3 Simple Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
              <article className="p-6">
                <div className="text-5xl font-bold text-primary mb-4">1</div>
                <h3 className="text-2xl font-heading font-semibold mb-3">Input Script or Idea</h3>
                <p className="text-neutral-darker">
                  Paste your text, upload a document, or simply type a concept. Our AI will understand your content.
                </p>
              </article>
              <article className="p-6">
                <div className="text-5xl font-bold text-primary mb-4">2</div>
                <h3 className="text-2xl font-heading font-semibold mb-3">Customize Style & Voice</h3>
                <p className="text-neutral-darker">
                  Choose from various video styles, pick your AI avatar, select a voice, and add your brand elements.
                </p>
              </article>
              <article className="p-6">
                <div className="text-5xl font-bold text-primary mb-4">3</div>
                <h3 className="text-2xl font-heading font-semibold mb-3">Generate & Download</h3>
                <p className="text-neutral-darker">
                  Click 'Generate', and our AI will craft your video. Preview, make tweaks, and download your masterpiece.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Use Cases/Examples Section */}
        <section id="use-cases" className="py-16 md:py-24 bg-neutral-lightest text-neutral-darkest opacity-0 animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 md:mb-16">
              Perfect for Any Video Project
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img src="https://via.placeholder.com/600x400.png?text=Marketing+Video" alt="AI Generated Marketing Video Example" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-heading font-semibold mb-3">Engaging Marketing Videos</h3>
                  <p className="text-neutral-darker">
                    Create compelling ads, product demos, and promotional content that converts viewers into customers.
                  </p>
                </div>
              </article>
              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img src="https://via.placeholder.com/600x400.png?text=Educational+Tutorial" alt="AI Generated Educational Content Example" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-heading font-semibold mb-3">Dynamic Educational Content</h3>
                  <p className="text-neutral-darker">
                    Transform learning materials into captivating video lessons, tutorials, and explainer videos.
                  </p>
                </div>
              </article>
              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img src="https://via.placeholder.com/600x400.png?text=Social+Media+Story" alt="AI Generated Social Media Story Example" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-heading font-semibold mb-3">Viral Social Media Stories</h3>
                  <p className="text-neutral-darker">
                    Produce eye-catching short videos, stories, and reels perfect for TikTok, Instagram, and more.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 text-neutral-darkest opacity-0 animate-fadeInUp" style={{ animationDelay: "0.8s" }}>
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 md:mb-16">
              Loved by Creators and Businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <article className="bg-white border border-neutral-lighter p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mr-4" aria-label="Avatar for Jane Doe">
                    JD
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-semibold">Jane Doe</h4>
                    <span className="text-sm text-neutral-DEFAULT">Marketing Manager, TechSolutions Inc.</span>
                  </div>
                </div>
                <p className="text-neutral-darker italic">
                  "VideoGen.ai has revolutionized our content strategy. We're creating high-quality videos in a fraction of the time and cost. The AI video creation tools are incredibly intuitive!"
                </p>
              </article>
              <article className="bg-white border border-neutral-lighter p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xl mr-4" aria-label="Avatar for Mark Smith">
                    MS
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-semibold">Mark Smith</h4>
                    <span className="text-sm text-neutral-DEFAULT">Online Course Creator</span>
                  </div>
                </div>
                <p className="text-neutral-darker italic">
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
