// components/Header.tsx
import Link from "next/link";
import LoginDialog from "@/components/LoginDialog";

export default function PublicHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          Logo
        </Link>
        <nav className="flex items-center space-x-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="/docs" className="hover:text-primary">
                Docs
              </Link>
            </li>
            <li>
              <Link href="/components" className="hover:text-primary">
                Components
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
            </li>
          </ul>
          {/* Login dialog on the top right */}
          <LoginDialog />
        </nav>
      </div>
    </header>
  );
}
