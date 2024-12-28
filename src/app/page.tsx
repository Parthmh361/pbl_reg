"use client";
import React, { useState, useEffect } from 'react';


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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To toggle between login and team details
  const [loading, setLoading] = useState(false);
  const [availableTopicsForMentor1, setAvailableTopicsForMentor1] = useState<string[]>([]);
  const [availableTopicsForMentor2, setAvailableTopicsForMentor2] = useState<string[]>([]);

  // Fetch mentors on page load
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch('/api/mentors');
        const mentors = await response.json();
        if (Array.isArray(mentors)) {
          setMentorOptions(mentors);
        } else {
          setMentorOptions([]);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
        setMentorOptions([]);
      }
    };
    fetchMentors();
  }, []);

  // Fetch available topics when a mentor is selected
  useEffect(() => {
    const fetchAvailableTopics = async (mentorId: string, setAvailableTopics: React.Dispatch<React.SetStateAction<string[]>>) => {
      try {
        const response = await fetch(`/api/topics?mentorId=${mentorId}`);
        const topics = await response.json();
        if (Array.isArray(topics)) {
          setAvailableTopics(topics.map((topic: { name: string }) => topic.name));
        } else {
          setAvailableTopics([]);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        setAvailableTopics([]);
      }
    };

    if (mentorOption1) {
      fetchAvailableTopics(mentorOption1, setAvailableTopicsForMentor1);
    }
    if (mentorOption2) {
      fetchAvailableTopics(mentorOption2, setAvailableTopicsForMentor2);
    }
  }, [mentorOption1, mentorOption2]);

  // Handle login and transition to team details page
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prn, email }),
      });
  
      if (response.ok) {
        // const data = await response.json();
        if (response.status === 200) {
          setIsLoggedIn(true);
        } else {
          setErrorMessage('Login failed. Please check your credentials.');
        }
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  // Handle team details submission
  // Handle team details submission
  const handleTeamDetailsSubmit = async () => {
    setLoading(true); // Show loading spinner when submitting the form
  
    try {
      // Fetch the topic IDs from the server based on the names
      const response1 = await fetch(`/api/topicId?name=${topicOption1}`);
      const response2 = await fetch(`/api/topicId?name=${topicOption2}`);
  
      if (!response1.ok || !response2.ok) {
        alert('Error fetching topic IDs. Please try again.');
        return;
      }
  
      const topic1Data = await response1.json();
      const topic2Data = await response2.json();
  
      const topic1Id = topic1Data?._id || null;
      const topic2Id = topic2Data?._id || null;
  
      if (!topic1Id || !topic2Id) {
        alert('Error finding topic IDs. Please try again.');
        return;
      }
  
      const userDetails = {
        prn,
        email,
        teamLeader,
        teamLeaderContact,
        teamLeaderSection,
        teamLeaderSemester,
        teamMembers,
        mentorOption1,
        mentorOption2,
        topicOption1: topic1Id, // Send _id instead of name
        topicOption2: topic2Id, // Send _id instead of name
      };
  
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails),
      });
  
      if (response.ok) {
        alert('Team details saved');
        window.location.href = '/thank';
 // Redirect to home page after successful submission
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving details');
      }
    } catch (error) {
      console.error('Error in handleTeamDetailsSubmit:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false); // Hide loading spinner after submission
    }
  };
  

  return (
    <div className="container">
      {!isLoggedIn ? (
        <div className="form-container">
          <h1>LOGIN<p> Strictly use only team leader email and prn to login.</p></h1>
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
      ) : (
        <div className="form-container">
          <h1>Team Details</h1>
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
            <input
              type="text"
              placeholder="Team Leader Section,A,B,C,D,E"
              value={teamLeaderSection}
              onChange={(e) => setTeamLeaderSection(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Team Leader Semester 1,2,3,4,5,6,7"
              value={teamLeaderSemester}
              onChange={(e) => setTeamLeaderSemester(e.target.value)}
            />
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
              <input
                type="text"
                placeholder="Section,A,B,C,D,E"
                value={member.section}
                onChange={(e) => {
                  const newMembers = [...teamMembers];
                  newMembers[index].section = e.target.value;
                  setTeamMembers(newMembers);
                }}
              />
              <input
                type="text"
                placeholder="Semester,1,2,3,4,5,6,7"
                value={member.semester}
                onChange={(e) => {
                  const newMembers = [...teamMembers];
                  newMembers[index].semester = e.target.value;
                  setTeamMembers(newMembers);
                }}
              />
            </div>
          ))}
          <div className="input-group">
            <select
              value={mentorOption1}
              onChange={(e) => setMentorOption1(e.target.value)}
            >
              <option value="">Select Mentor Priority 1</option>
              {mentorOptions.map((mentor) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <select
              value={mentorOption2}
              onChange={(e) => setMentorOption2(e.target.value)}
            >
              <option value="">Select Mentor Priority 2</option>
              {mentorOptions
                .filter((mentor) => mentor._id !== mentorOption1) // Filter out the selected mentor from option 1
                .map((mentor) => (
                  <option key={mentor._id} value={mentor._id}>
                    {mentor.name}
                  </option>
                ))}
            </select>
          </div>
          {mentorOption1 && (
            <div className="input-group">
              <select
                value={topicOption1}
                onChange={(e) => setTopicOption1(e.target.value)}
              >
                <option value="">Select Topic for Mentor Priority 1</option>
                {availableTopicsForMentor1.map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          )}
          {mentorOption2 && (
            <div className="input-group">
              <select
                value={topicOption2}
                onChange={(e) => setTopicOption2(e.target.value)}
              >
                <option value="">Select Topic for Mentor Priority 2</option>
                {availableTopicsForMentor2.map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="input-group">
            <button onClick={handleTeamDetailsSubmit}>Submit Team</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
