// src/app/thanks/page.tsx

"use client"; // Ensure the component is rendered client-side

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const ThanksPage = () => {
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold text-blue-600">Thank you for registering!</h1>
      <p className="mt-4 text-lg text-gray-800">
        Your registration has been successfully submitted. You will be redirected to the homepage shortly.
      </p>
      <p className="mt-4 text-md text-gray-600">
        If you are not redirected, click <a href="/" className="text-blue-500 underline">here</a>.
      </p>
    </div>
  );
};

export default ThanksPage;
