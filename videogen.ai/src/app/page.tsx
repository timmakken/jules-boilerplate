import Image from 'next/image';
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
      {/* Schema.org JSON-LD is now handled by Next.js metadata API */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />

      <main className="bg-background text-foreground">
        {/* Hero Section */}
        <section id="hero" className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Media - Using a high-quality AI/tech themed image */}
          <div className="absolute inset-0 z-0 bg-neutral-darkest">
            <Image 
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
              alt="AI video generation technology background" 
              fill
              style={{ objectFit: 'cover' }}
              className="opacity-60"
              priority
            />
          </div>
          <div className="container relative z-10 mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Transform Text into Stunning AI Videos, Instantly.
            </h1>
            <p className="text-lg md:text-xl text-neutral-lightest mb-10 max-w-2xl mx-auto">
              Unleash the power of AI video creation. VideoGen.ai helps you produce engaging videos from scripts or ideas in minutes, no complex editing required.
            </p>
            <button
              type="button"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-300 transform hover:scale-105 z-10"
            >
              Create Your First Video for Free
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-neutral-lightest text-neutral-darkest opacity-0 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
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
                <h3 className="text-2xl font-semibold mb-3">Powerful Text-to-Video</h3>
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
                <h3 className="text-2xl font-semibold mb-3">Customizable Templates</h3>
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
                <h3 className="text-2xl font-semibold mb-3">Realistic Voice Cloning</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
              Generate Videos in 3 Simple Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
              <article className="p-6">
                <div className="text-5xl font-bold text-primary mb-4">1</div>
                <h3 className="text-2xl font-semibold mb-3">Input Script or Idea</h3>
                <p className="text-neutral-darker">
                  Paste your text, upload a document, or simply type a concept. Our AI will understand your content.
                </p>
              </article>
              <article className="p-6">
                <div className="text-5xl font-bold text-primary mb-4">2</div>
                <h3 className="text-2xl font-semibold mb-3">Customize Style & Voice</h3>
                <p className="text-neutral-darker">
                  Choose from various video styles, pick your AI avatar, select a voice, and add your brand elements.
                </p>
              </article>
              <article className="p-6">
                <div className="text-5xl font-bold text-primary mb-4">3</div>
                <h3 className="text-2xl font-semibold mb-3">Generate & Download</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
              Perfect for Any Video Project
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80" 
                    alt="AI Generated Marketing Video Example" 
                    width={600} 
                    height={400} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">Engaging Marketing Videos</h3>
                  <p className="text-neutral-darker">
                    Create compelling ads, product demos, and promotional content that converts viewers into customers.
                  </p>
                </div>
              </article>
              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80" 
                    alt="AI Generated Educational Content Example" 
                    width={600} 
                    height={400} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">Dynamic Educational Content</h3>
                  <p className="text-neutral-darker">
                    Transform learning materials into captivating video lessons, tutorials, and explainer videos.
                  </p>
                </div>
              </article>
              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80" 
                    alt="AI Generated Social Media Story Example" 
                    width={600} 
                    height={400} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">Viral Social Media Stories</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
              Loved by Creators and Businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <article className="bg-white border border-neutral-lighter p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80" 
                      alt="Jane Doe" 
                      width={48} 
                      height={48} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">Jane Doe</h4>
                    <span className="text-sm text-neutral">Marketing Manager, TechSolutions Inc.</span>
                  </div>
                </div>
                <p className="text-neutral-darker italic">
                  "VideoGen.ai has revolutionized our content strategy. We're creating high-quality videos in a fraction of the time and cost. The AI video creation tools are incredibly intuitive!"
                </p>
              </article>
              <article className="bg-white border border-neutral-lighter p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80" 
                      alt="Mark Smith" 
                      width={48} 
                      height={48} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">Mark Smith</h4>
                    <span className="text-sm text-neutral">Online Course Creator</span>
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
    </>
  );
}
