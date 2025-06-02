import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us | Videogen.ai - Our Mission, Vision, and Team",
  description: "Learn more about Videogen.ai, our mission to revolutionize AI video generation, our vision for the future, and the passionate team behind our innovative platform.",
  keywords: ["about videogen.ai", "AI video company", "our team", "mission", "vision", "AI video generation"],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl"> {/* Increased max-width for more content */}

        {/* Hero/Intro Section */}
        <section id="about-hero" className="text-center mb-16 md:mb-24 opacity-0 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-4xl md:text-5xl font-heading text-primary mb-6">
            About Videogen.ai
          </h1>
          <p className="text-lg md:text-xl text-neutral-darker max-w-3xl mx-auto mb-12">
            We are passionate about empowering creators, marketers, and businesses with the transformative power of AI to effortlessly generate stunning video content.
          </p>
          <div className="w-full h-64 bg-neutral-lighter rounded-lg shadow-md flex items-center justify-center text-neutral-DEFAULT mb-12">
            About Us Page - Hero Image Placeholder
          </div>
        </section>

        {/* Our Mission Section */}
        <section id="mission" className="mb-16 md:mb-24 opacity-0 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
          <div className="max-w-3xl mx-auto text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-heading text-neutral-darkest mb-4">Our Mission</h2>
            <p className="text-neutral-darker text-lg">
              Our mission is to democratize video creation by providing an intuitive, powerful, and accessible AI-driven platform that enables anyone to produce professional-quality videos, regardless of technical skill or budget. We aim to unlock creativity and streamline communication for individuals and organizations worldwide.
              {/* [User to fill in: Clearly state the company's primary goal and purpose related to AI video generation and empowering users.] */}
            </p>
          </div>
        </section>

        {/* Our Vision Section */}
        <section id="vision" className="mb-16 md:mb-24 opacity-0 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
          <div className="max-w-3xl mx-auto text-center md:text-right"> {/* Text align right for variation */}
            <h2 className="text-2xl md:text-3xl font-heading text-neutral-darkest mb-4">Our Vision</h2>
            <p className="text-neutral-darker text-lg">
              We envision a future where video is the primary medium for storytelling and communication, and where AI acts as a seamless collaborator, empowering creators to bring their visions to life faster and more effectively than ever before. We strive to be at the forefront of this evolution, constantly innovating to make video creation smarter, simpler, and more inspiring.
              {/* [User to fill in: Describe the future the company aims to create and its long-term aspirations in the AI video space.] */}
            </p>
          </div>
        </section>

        {/* Our Values Section */}
        <section id="values" className="mb-16 md:mb-24 opacity-0 animate-fadeInUp" style={{ animationDelay: "0.7s" }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading text-neutral-darkest mb-6">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-heading text-primary mb-2">Innovation</h3>
                <p className="text-neutral-darker text-sm">We relentlessly pursue cutting-edge AI and user experience advancements to redefine video creation.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-heading text-primary mb-2">Empowerment</h3>
                <p className="text-neutral-darker text-sm">We believe in providing tools that unlock the creative potential in everyone, from beginners to pros.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-heading text-primary mb-2">Customer-Centricity</h3>
                <p className="text-neutral-darker text-sm">Our users are at the heart of everything we do. We listen, learn, and build for their success.</p>
              </div>
            </div>
            {/* <p className="text-neutral-darker text-lg mt-6">
              [User to fill in: List or describe core values like Innovation, Creativity, Customer Focus, etc.]
            </p> */}
          </div>
        </section>

        {/* Meet the Team Section (Placeholder) */}
        <section id="team" className="mb-12 opacity-0 animate-fadeInUp" style={{ animationDelay: "0.9s" }}>
          <h2 className="text-2xl md:text-3xl font-heading text-neutral-darkest mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Team Member Card 1 */}
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-32 h-32 bg-neutral-lighter rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-DEFAULT">
                Avatar
              </div>
              <h3 className="text-xl font-heading text-neutral-darkest mb-1">Team Member Name</h3>
              <p className="text-primary font-semibold">CEO & Co-Founder</p>
              <p className="text-sm text-neutral-darker mt-2">
                [User to fill in: Brief bio or fun fact about the team member. Example: Visionary leader with a passion for AI and creative tools.]
              </p>
            </div>
            {/* Team Member Card 2 */}
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-32 h-32 bg-neutral-lighter rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-DEFAULT">
                Avatar
              </div>
              <h3 className="text-xl font-heading text-neutral-darkest mb-1">Another Member</h3>
              <p className="text-primary font-semibold">CTO & Co-Founder</p>
              <p className="text-sm text-neutral-darker mt-2">
                [User to fill in: Brief bio or fun fact about the team member. Example: Tech enthusiast building the future of video generation.]
              </p>
            </div>
            {/* Team Member Card 3 */}
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-32 h-32 bg-neutral-lighter rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-DEFAULT">
                Avatar
              </div>
              <h3 className="text-xl font-heading text-neutral-darkest mb-1">Yet Another Member</h3>
              <p className="text-primary font-semibold">Head of Product</p>
              <p className="text-sm text-neutral-darker mt-2">
                [User to fill in: Brief bio or fun fact about the team member. Example: Dedicated to creating an intuitive and powerful user experience.]
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
