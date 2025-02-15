"use client"; // Ensure the component is rendered client-side

const ThanksPage = () => {
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold text-blue-600">Thank you for registering!</h1>
      <p className="mt-4 text-lg text-gray-800">
        Your registration has been successfully submitted. 
      </p>
      <div className="text-center">
        <p className="text-sm">
          Design and Developed by <span className="font-semibold">Parth Prashant Choudhari</span>, Web Developer, IEEE Student Branch (STB 60217705), SIT Nagpur
        </p>
        <p className="text-sm mt-1">
          Under the guidance of <span className="font-semibold">Dr. Sudhanshu Maurya</span>, PBL Coordinator
        </p>
        <div className="mt-2 text-gray-400 text-xs">
          © {new Date().getFullYear()} SIT Nagpur. All rights reserved.
        </div>
      </div>
    </div>
    
  );
};

export default ThanksPage;
