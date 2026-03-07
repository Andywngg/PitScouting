import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="border-b border-slate-700/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Team 1334 Logo" className="h-10 w-10 rounded-full border border-rose-300/30" />
              <span className="text-2xl font-black tracking-tight text-amber-100">1334 Red Devils</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/scout"
              className="rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-100 hover:border-rose-300/30 hover:bg-slate-800/80"
            >
              Scout Form
            </Link>
            <Link
              to="/dashboard"
              className="rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
