import Link from "next/link"
import { Twitter, Instagram, Linkedin, Youtube, Zap } from "lucide-react"

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
    <footer className="w-full bg-slate-950 text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                EverGo
              </span>
            </Link>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              The competitive network for athletes. Track, battle, dominate.
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-white transition-colors border border-slate-800"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-orange-400 transition-colors"
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
        <div className="py-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} EverGo. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Built for athletes in Prague
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
