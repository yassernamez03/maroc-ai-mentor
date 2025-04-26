
import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-white dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-morocco-blue dark:text-morocco-mint">404</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-morocco-blue hover:bg-morocco-blue/90"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
