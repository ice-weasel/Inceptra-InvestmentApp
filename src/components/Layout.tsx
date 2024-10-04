/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';

export default function Layout({ children }:any) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Inceptra 2024
          </Link>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/leaderBoard" className="hover:underline">
                Leaderboard
              </Link>
            </li>
            {/* Add more navigation items as needed */}
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-200 p-4 text-center">
        <p>&copy; 2024 Investment Competition. All rights reserved.</p>
      </footer>
    </div>
  );
}