import { Link } from "react-router-dom";
import { FileText, MessageCircle } from "lucide-react";

// Reusable Footer Link
const FooterLink = ({ href, to, children }) => {
  const className =
    "block text-gray-400 hover:text-white transition-colors duration-200";

  if (to) return <Link to={to} className={className}>{children}</Link>;
  return <a href={href} className={className}>{children}</a>;
};

// Reusable Social Link
const SocialLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 bg-blue-950 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* GRID START */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 - Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-950 rounded-md flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">AI Invoice App</span>
            </Link>

            <p className="text-gray-400 leading-relaxed text-sm">
              The simplest way to create and send professional invoices.
            </p>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h3 className="text-base font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><FooterLink href="#features">Features</FooterLink></li>
              <li><FooterLink href="#testimonials">Testimonials</FooterLink></li>
              <li><FooterLink href="#faq">FAQ</FooterLink></li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h3 className="text-base font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><FooterLink to="/about">About Us</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h3 className="text-base font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/terms">Terms of Services</FooterLink></li>
            </ul>
          </div>

        </div>
        {/* GRID END */}

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; 2026 AI Invoice App. All rights reserved.
          </p>

          <div className="flex space-x-4">
            <SocialLink href="#"><MessageCircle className="w-5 h-5" /></SocialLink>
            <SocialLink href="#"><MessageCircle className="w-5 h-5" /></SocialLink>
            <SocialLink href="#"><MessageCircle className="w-5 h-5" /></SocialLink>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;