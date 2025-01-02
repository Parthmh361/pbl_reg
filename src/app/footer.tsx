import React from "react";
import './footer.css'; // Import the CSS file

const Footer: React.FC = () => {
  return (
    <div className="footer">
      <p className="text-sm">
        Design and Developed by  <a
          href="https://www.linkedin.com/in/parth-choudhari-2073a0294"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-500 hover:underline"
        >
          Parth Prashant Choudhari
        </a>, Web Developer, IEEE Student Branch (STB 60217705), SIT Nagpur
      </p>
      <p className="text-sm">
        Under the guidance of <span className="font-semibold">Dr. Sudhanshu Maurya</span>, PBL Coordinator
      </p>
      <div className="text-xs mt-2">
        © {new Date().getFullYear()} SIT Nagpur. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
