import Link from 'next/link';

export default function Navbar() {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/generate', label: 'Generate Video' },
    // Add other main navigation links here
  ];

  const authItems = [
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Sign Up' },
  ];

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-400">
          videogen.ai
        </Link>
        <div className="space-x-4">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-blue-300">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="space-x-4">
          {authItems.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-blue-300">
              {item.label}
            </Link>
          ))}
          {/* Placeholder for user profile/logout when logged in */}
          {/* <Link href="/dashboard" className="hover:text-blue-300">Dashboard</Link> */}
          {/* <Link href="/account" className="hover:text-blue-300">Account</Link> */}
        </div>
      </div>
    </nav>
  );
}
