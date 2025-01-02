import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
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
    </footer>
  );
};

export default Footer;
