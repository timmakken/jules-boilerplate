import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-400 py-8 md:py-12 border-t border-gray-700">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p>&copy; {currentYear} Videogen.ai. All rights reserved.</p>
          </div>

          {/* Footer Links */}
          <nav className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link href="/about" className="hover:text-teal-400 transition-colors duration-300">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-teal-400 transition-colors duration-300">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-teal-400 transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-teal-400 transition-colors duration-300">
              Terms of Service
            </Link>
          </nav>

          {/* Social Media Placeholders */}
          <div className="flex justify-center md:justify-end space-x-4">
            <a href="#" aria-label="Facebook" className="hover:text-teal-400 transition-colors duration-300">
              [FB]
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-teal-400 transition-colors duration-300">
              [TW]
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-teal-400 transition-colors duration-300">
              [LI]
            </a>
            {/* Replace [FB], [TW], [LI] with actual icons or SVG components later */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
