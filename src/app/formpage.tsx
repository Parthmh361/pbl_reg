"use client";
import React, { useState, useEffect } from 'react';
import './footer.css';

interface TeamMember {
  name: string;
  email: string;
  contact: string;
  prn: string;
  section: string;
  semester: string;
}

interface Mentor {
  _id: string;
  name: string;
  assignedTopics: string[];
}

const MainPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [prn, setPrn] = useState('');
  const [email, setEmail] = useState('');
  const [teamLeader, setTeamLeader] = useState('');
  const [teamLeaderContact, setTeamLeaderContact] = useState('');
  const [teamLeaderSection, setTeamLeaderSection] = useState('');
  const [teamLeaderSemester, setTeamLeaderSemester] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: '', email: '', contact: '', prn: '', section: '', semester: '' },
    { name: '', email: '', contact: '', prn: '', section: '', semester: '' },
  ]);
  const [mentorOptions, setMentorOptions] = useState<Mentor[]>([]);
  const [mentorOption1, setMentorOption1] = useState('');
  const [mentorOption2, setMentorOption2] = useState('');
  const [topicOption1, setTopicOption1] = useState('');
  const [topicOption2, setTopicOption2] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTopicsForMentor1, setAvailableTopicsForMentor1] = useState<string[]>([]);
  const [availableTopicsForMentor2, setAvailableTopicsForMentor2] = useState<string[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [loadingTopics1, setLoadingTopics1] = useState(false);
  const [loadingTopics2, setLoadingTopics2] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoadingMentors(true);
      try {
        const response = await fetch('/api/mentors12');
        const mentors = await response.json();
        if (Array.isArray(mentors)) {
          setMentorOptions(mentors);
        } else {
          setMentorOptions([]);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
        setMentorOptions([]);
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, []);

  useEffect(() => {
    const fetchAvailableTopics = async (
      mentorId: string, 
      type: '1' | '2', 
      setAvailableTopics: React.Dispatch<React.SetStateAction<string[]>>, 
      setLoadingTopics: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      setLoadingTopics(true);
      try {
        // Fetch topics based on mentor ID and type
        const response = await fetch(`/api/topics12?mentorId=${mentorId}&type=${type}`);
        const topics = await response.json();
        if (Array.isArray(topics)) {
          setAvailableTopics(topics.map((topic: { name: string }) => topic.name));
        } else {
          setAvailableTopics([]);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        setAvailableTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };
  
    // Fetch topics for mentorOption1 (Topic1)
    if (mentorOption1) {
      fetchAvailableTopics(mentorOption1, '1', setAvailableTopicsForMentor1, setLoadingTopics1); // Type 1 for Topic1
    }
  
    // Fetch topics for mentorOption2 (Topic2)
    if (mentorOption2) {
      fetchAvailableTopics(mentorOption2, '2', setAvailableTopicsForMentor2, setLoadingTopics2); // Type 2 for Topic2
    }
  }, [mentorOption1, mentorOption2]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prn, email }),
      });
  
      // Handle different responses dynamically
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        const errorData = await response.json(); // Parse the error response body
        setErrorMessage(errorData.error || 'Login failed. Please check your credentials.'); // Use the dynamic error message
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTeamDetailsSubmit = async () => {
    setLoading(true);
  
    try {
      // Fetch topic ID for Topic1
      const response1 = await fetch(`/api/topicId12?name=${topicOption1}&type=1`);
      if (!response1.ok) {
        alert('Error fetching Topic1 ID. Please try again.');
        return;
      }
      const topic1Data = await response1.json();
      const topic1Id = topic1Data?._id || null;
  
      if (!topic1Id) {
        alert('Error finding Topic1 ID. Please ensure Topic1 is selected.');
        return;
      }
  
      let topic2Id = null;
      if (topicOption2) {
        // Fetch topic ID for Topic2
        const response2 = await fetch(`/api/topicId12?name=${topicOption2}&type=2`);
        if (!response2.ok) {
          alert('Error fetching Topic2 ID. Please try again.');
          return;
        }
        const topic2Data = await response2.json();
        topic2Id = topic2Data?._id || null;
  
        if (!topic2Id) {
          alert('Error finding Topic2 ID. Please check the Topic2 name.');
          return;
        }
      }
  
      // Prepare user details
      const userDetails = {
        prn,
        email,
        teamLeader: {
          name: teamLeader,
          prn,
          semester: teamLeaderSemester,
          section: teamLeaderSection,
          contact: teamLeaderContact,
          email,
        },
        teamMembers,
        mentorOption1,
        mentorOption2: mentorOption2 || null,
        topicOption1: topic1Id,
        topicOption2: topic2Id || null,
      };
  
      // Submit the user details
      const response = await fetch('/api/register12', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails),
      });
  
      if (response.ok) {
        alert('Team details saved successfully.');
        window.location.href = '/thank';
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving details');
      }
    } catch (error) {
      console.error('Error in handleTeamDetailsSubmit:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      {!isLoggedIn ? (
      <div className="container">
        <h1 className='headin'>PROJECT BASED LEARNING</h1>
      <div className="form-container">
  
        <h1 className="login-heading">
          LOGIN
          <p>Strictly use only Team leaders official email and PRN to login.</p>
        </h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="PRN"
              value={prn}
              onChange={(e) => setPrn(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {errorMessage && (
            <div className="error-message" style={{ color: 'red' }}>
              {errorMessage}
            </div>
          )}
          <div className="input-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    
      <div className="footer">
        <p className="text-sm">
          Design and Developed by{' '}
          <a
            href="https://www.linkedin.com/in/parth-choudhari-2073a0294"
            target="_blank"
            rel="noopener noreferrer"
            className='cccc'
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
      
        </div>
      ) : (
        <>
        
        <div className="form-container">
          <h1 className='team-details-heading'>Project Based Learning (PBL) Team Details</h1>
          <div className="input-group">
            <input
              type="text"
              placeholder="Team Leader Name"
              value={teamLeader}
              onChange={(e) => setTeamLeader(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Team Leader Contact No"
              value={teamLeaderContact}
              onChange={(e) => setTeamLeaderContact(e.target.value)}
            />
          </div>
          <div className="input-group">
            <select
              value={teamLeaderSection}
              onChange={(e) => setTeamLeaderSection(e.target.value)}
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>
          <div className="input-group">
            <select
              value={teamLeaderSemester}
              onChange={(e) => setTeamLeaderSemester(e.target.value)}
            >
              <option value="">Select Semester</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </div>

          {teamMembers.map((member, index) => (
            <div key={index} className="team-member-form">
              <h3>Team Member {index + 1}</h3>
              <input
                type="text"
                placeholder="Name"
                value={member.name}
                onChange={(e) => {
                  const newMembers = [...teamMembers];
                  newMembers[index].name = e.target.value;
                  setTeamMembers(newMembers);
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={member.email}
                onChange={(e) => {
                  const newMembers = [...teamMembers];
                  newMembers[index].email = e.target.value;
                  setTeamMembers(newMembers);
                }}
              />
              <input
                type="text"
                placeholder="Contact No"
                value={member.contact}
                onChange={(e) => {
                  const newMembers = [...teamMembers];
                  newMembers[index].contact = e.target.value;
                  setTeamMembers(newMembers);
                }}
              />
              <input
                type="text"
                placeholder="PRN"
                value={member.prn}
                onChange={(e) => {
                  const newMembers = [...teamMembers];
                  newMembers[index].prn = e.target.value;
                  setTeamMembers(newMembers);
                }}
              />
              <select
                value={member.section}
                onChange={(e) => {
                  const newMembers = [...teamMembers];
                  newMembers[index].section = e.target.value;
                  setTeamMembers(newMembers);
                }}
              >
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
              <select
                value={member.semester}
                onChange={(e) => {
                  const newMembers = [...teamMembers];
                  newMembers[index].semester = e.target.value;
                  setTeamMembers(newMembers);
                }}
              >
                <option value="">Select Semester</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
            </div>
          ))}

          {/* Choose Your Mentor Section */}
          <div className="mentor-section">
            <h2 className="mentor-heading">Choose Your Mentor</h2>
            <h4> (If topics of a particular mentor are not visible it means that all the topics of that mentors got booked)</h4>
            {/* Faculty Preference 1 */}
            <div className="faculty-preference">
              <h3>Faculty Preference 1</h3>
              <select
                value={mentorOption1}
                onChange={(e) => setMentorOption1(e.target.value)}
              >
                <option value="">Select Mentor Priority 1</option>
                {loadingMentors ? (
                  <option disabled>Loading Mentors...</option>
                ) : (
                  mentorOptions.map((mentor) => (
                    <option key={mentor._id} value={mentor._id}>
                      {mentor.name}
                    </option>
                  ))
                )}
              </select>
              {loadingTopics1 ? (
                <div>Loading topics...</div>
              ) : (
                mentorOption1 && (
                  <select
                    value={topicOption1}
                    onChange={(e) => setTopicOption1(e.target.value)}
                  >
                    <option value="">Select Topic for Faculty Preference 1</option>
                    {availableTopicsForMentor1.map((topic, index) => (
                      <option key={index} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                )
              )}
            </div>

            {/* Faculty Preference 2 */}
            <div className="faculty-preference">
              <h3>Faculty Preference 2</h3>
              <select
                value={mentorOption2}
                onChange={(e) => setMentorOption2(e.target.value)}
              >
                <option value="">Select Faculty Preference 2</option>
                {loadingMentors ? (
                  <option disabled>Loading Mentors...</option>
                ) : (
                  mentorOptions
                    .filter((mentor) => mentor._id !== mentorOption1)
                    .map((mentor) => (
                      <option key={mentor._id} value={mentor._id}>
                        {mentor.name}
                      </option>
                    ))
                )}
              </select>
              {loadingTopics2 ? (
                <div>Loading topics...</div>
              ) : (
                mentorOption2 && (
                  <select
                    value={topicOption2}
                    onChange={(e) => setTopicOption2(e.target.value)}
                  >
                    <option value="">Select Topic for Faculty Preference 2</option>
                    {availableTopicsForMentor2.map((topic, index) => (
                      <option key={index} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                )
              )}
            </div>
          </div>

          <div className="input-group">
            <button onClick={handleTeamDetailsSubmit}>
              {loading ? 'Submitting...' : 'Submit Team'}
            </button>
          </div>
          
        </div>
        <div className="footer">
        <p className="text-sm">
          Design and Developed by{' '}
          <a
            href="https://www.linkedin.com/in/parth-choudhari-2073a0294"
            target="_blank"
            rel="noopener noreferrer"
            className='cccc'
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
        </>
      )}
    </div>
  );
};

export default MainPage;
