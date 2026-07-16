import { Link } from "@inertiajs/react";

const Header = () => {
  return (
    <header className="bg-white py-5">
      <nav className="flex justify-between items-center container mx-auto px-16">
        <div className="logo font-semibold text-2xl">Logo</div>
        <ul className="flex space-x-2">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
