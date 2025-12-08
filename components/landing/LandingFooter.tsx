import Link from "next/link"
import { Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#comparison", label: "Compare" },
      { href: "/pricing", label: "Pricing" },
      { href: "/download", label: "Download App" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/careers", label: "Careers" },
      { href: "/blog", label: "Blog" },
      { href: "/press", label: "Press" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { href: "/help", label: "Help Center" },
      { href: "/community", label: "Community" },
      { href: "/developers", label: "Developers" },
      { href: "/status", label: "Status" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/gdpr", label: "GDPR" },
    ],
  },
}

const socialLinks = [
  { href: "https://twitter.com/evergo", icon: Twitter, label: "Twitter" },
  { href: "https://instagram.com/evergo", icon: Instagram, label: "Instagram" },
  { href: "https://linkedin.com/company/evergo", icon: Linkedin, label: "LinkedIn" },
  { href: "https://youtube.com/evergo", icon: Youtube, label: "YouTube" },
]

export function LandingFooter() {
  return (
    <footer className="w-full bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <span className="text-2xl">⚡</span>
              EverGo
            </Link>
            <p className="text-sm text-gray-400 mb-6">
              The global network for sports. Track, compete, connect.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm mb-4 text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} EverGo. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Made with passion for athletes</span>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-white transition-colors">
              English
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
