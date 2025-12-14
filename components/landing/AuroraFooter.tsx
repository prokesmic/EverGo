import Link from "next/link"
import { Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#comparison", label: "Compare" },
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

export function AuroraFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-[1.3fr,2fr] gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900">
              ⚡EverGo
            </span>
          </Link>
          <p className="text-sm text-slate-600 max-w-xs">
            The global network for sports. Track, compete, and connect with
            athletes in every discipline.
          </p>

          {/* Social Links */}
          <div className="flex gap-3 pt-2">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-4 text-slate-900">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EverGo. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Made with passion for athletes</span>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              English
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
