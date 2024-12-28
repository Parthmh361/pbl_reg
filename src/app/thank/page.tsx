"use client"; // Ensure the component is rendered client-side

const ThanksPage = () => {
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold text-blue-600">Thank you for registering!</h1>
      <p className="mt-4 text-lg text-gray-800">
        Your registration has been successfully submitted. 
      </p>
    </div>
  );
};

export default ThanksPage;
