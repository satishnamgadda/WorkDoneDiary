import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserManagement from './UserManagement';

const Dashboard = ({ user, onLogout, apiBaseUrl }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    pendingReviews: 0,
    completionRate: 0
  });
  const [newEntry, setNewEntry] = useState({
    subject: '',
    department: user.department, // Auto-fill from user's registered department
    topic: '',
    content: '',
    syllabus_progress: 0
  });

  const departmentSubjects = {
    'Computer Science': ['Programming', 'Database', 'Networks', 'Algorithms', 'Software Engineering', 'Data Structures', 'Operating Systems'],
    'Electronics': ['Digital Electronics', 'Analog Electronics', 'Microprocessors', 'Communication Systems', 'Control Systems', 'VLSI Design'],
    'Mechanical': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing', 'Heat Transfer', 'Mechanics of Materials'],
    'Civil': ['Structural Engineering', 'Geotechnical Engineering', 'Transportation Engineering', 'Environmental Engineering', 'Construction Management'],
    'Electrical': ['Power Systems', 'Electrical Machines', 'Power Electronics', 'Control Systems', 'Electrical Circuits', 'Renewable Energy']
  };

  const subjectTopics = {
    // Computer Science
    'Programming': ['Variables & Data Types', 'Control Structures', 'Functions', 'Object-Oriented Programming', 'Exception Handling'],
    'Database': ['SQL Basics', 'Database Design', 'Normalization', 'Joins', 'Stored Procedures'],
    'Networks': ['OSI Model', 'TCP/IP', 'Routing', 'Network Security', 'Wireless Networks'],
    'Algorithms': ['Sorting Algorithms', 'Searching Algorithms', 'Graph Algorithms', 'Dynamic Programming', 'Complexity Analysis'],
    'Software Engineering': ['SDLC Models', 'Requirements Analysis', 'System Design', 'Testing', 'Project Management'],
    'Data Structures': ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Hash Tables'],
    'Operating Systems': ['Process Management', 'Memory Management', 'File Systems', 'CPU Scheduling', 'Deadlocks'],
    
    // Electrical
    'Power Systems': ['Power Generation', 'Transmission Lines', 'Distribution Systems', 'Load Flow Analysis', 'Protection Systems'],
    'Electrical Machines': ['DC Motors', 'AC Motors', 'Transformers', 'Generators', 'Motor Control'],
    'Power Electronics': ['Rectifiers', 'Inverters', 'Choppers', 'PWM Techniques', 'Power Devices'],
    'Control Systems': ['Transfer Functions', 'PID Controllers', 'Root Locus', 'Frequency Response', 'State Space'],
    'Electrical Circuits': ['Ohms Law', 'AC/DC Analysis', 'Network Theorems', 'Resonance', 'Filters'],
    'Renewable Energy': ['Solar Power', 'Wind Energy', 'Energy Storage', 'Grid Integration', 'Power Quality'],
    
    // Electronics
    'Digital Electronics': ['Logic Gates', 'Boolean Algebra', 'Flip Flops', 'Counters', 'Memory Devices'],
    'Analog Electronics': ['Diodes', 'Transistors', 'Amplifiers', 'Oscillators', 'Op-Amps'],
    'Microprocessors': ['8085 Architecture', 'Assembly Language', 'Interfacing', 'Memory Organization'],
    'Communication Systems': ['Modulation', 'Signal Processing', 'Antennas', 'Wireless Communication', 'Fiber Optics'],
    'VLSI Design': ['CMOS Technology', 'Logic Design', 'Layout Design', 'Verification', 'Testing'],
    
    // Mechanical
    'Thermodynamics': ['Laws of Thermodynamics', 'Heat Engines', 'Refrigeration', 'Steam Tables', 'Gas Cycles'],
    'Fluid Mechanics': ['Fluid Properties', 'Fluid Statics', 'Flow Measurement', 'Pumps', 'Turbines'],
    'Machine Design': ['Design Process', 'Material Selection', 'Stress Analysis', 'Fatigue', 'Bearings'],
    'Manufacturing': ['Machining Processes', 'Casting', 'Welding', 'Quality Control', 'Automation'],
    'Heat Transfer': ['Conduction', 'Convection', 'Radiation', 'Heat Exchangers', 'Thermal Analysis'],
    'Mechanics of Materials': ['Stress & Strain', 'Beam Theory', 'Torsion', 'Column Buckling', 'Material Properties'],
    
    // Civil
    'Structural Engineering': ['Beam Analysis', 'Column Design', 'Foundation Design', 'Steel Structures', 'Concrete Design'],
    'Geotechnical Engineering': ['Soil Properties', 'Foundation Engineering', 'Slope Stability', 'Earth Pressure'],
    'Transportation Engineering': ['Highway Design', 'Traffic Engineering', 'Pavement Design', 'Transportation Planning'],
    'Environmental Engineering': ['Water Treatment', 'Wastewater Treatment', 'Air Pollution Control', 'Solid Waste Management'],
    'Construction Management': ['Project Planning', 'Cost Estimation', 'Scheduling', 'Quality Control', 'Safety Management']
  };

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
  const availableSubjects = user.department ? (departmentSubjects[user.department] || []) : [];
  const availableTopics = newEntry.subject ? (subjectTopics[newEntry.subject] || []) : [];

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  const handleDepartmentChange = (department) => {
    setNewEntry({
      ...newEntry,
      department: department,
      subject: '', // Reset subject when department changes
      topic: ''    // Reset topic when department changes
    });
  };

  const handleSubjectChange = (subject) => {
    setNewEntry({
      ...newEntry,
      subject: subject,
      topic: '' // Reset topic when subject changes
    });
  };

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/entries/`);
      setEntries(response.data.entries || []);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      setEntries([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/dashboard/stats`);
      setStats({
        totalEntries: response.data.total_entries || 0,
        pendingReviews: response.data.checked_assignments || 0,
        completionRate: response.data.avg_syllabus_percent || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      // Transform frontend data to match backend API
      const entryData = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        department: newEntry.department,
        subject: newEntry.subject,
        class_name: '',
        syllabus_percent: newEntry.syllabus_progress,
        remarks: newEntry.content,
        lectures: newEntry.topic ? [{
          topic: newEntry.topic,
          duration: 50,
          class_name: ''
        }] : []
      };
      
      console.log('Sending entry data:', entryData);
      await axios.post(`${apiBaseUrl}/entries/`, entryData);
      setNewEntry({
        subject: '',
        department: user.department, // Keep user's department
        topic: '',
        content: '',
        syllabus_progress: 0
      });
      fetchEntries();
      fetchStats();
      setActiveView('diary');
    } catch (error) {
      console.error('Failed to add entry:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to add entry: ${error.response?.data?.error || 'Please try again.'}`);
    }
  };

  const renderDashboard = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalEntries}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingReviews}</div>
          <div className="stat-label">Pending Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>

      <div className="content-card">
        <h2 className="card-title">Recent Activity</h2>
        {entries.slice(0, 3).map(entry => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header">
              <div>
                <span className="entry-subject">{entry.subject}</span>
                <span className="entry-teacher"> - by {entry.author_name} ({entry.author_role})</span>
              </div>
              <span className="entry-date">{new Date(entry.created_at).toLocaleDateString()}</span>
            </div>
            <div className="entry-content">
              {entry.lectures && entry.lectures.length > 0 
                ? entry.lectures[0].topic 
                : (entry.topic || entry.remarks)
              }
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${entry.syllabus_progress || entry.syllabus_percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAddEntry = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Entry</h1>
        <p className="page-subtitle">Record your teaching progress</p>
      </div>

      <div className="content-card">
        <form onSubmit={handleAddEntry}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value={user.department}
                disabled
                style={{ backgroundColor: '#2a2d3a', color: '#9ca3af' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={newEntry.subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                required
              >
                <option value="">Select Subject</option>
                {availableSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Topic</label>
            <select
              className="form-select"
              value={newEntry.topic}
              onChange={(e) => setNewEntry({...newEntry, topic: e.target.value})}
              required
              disabled={!newEntry.subject}
            >
              <option value="">Select Topic</option>
              {availableTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-input"
              rows="4"
              value={newEntry.content}
              onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Syllabus Progress (%)</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="100"
              value={newEntry.syllabus_progress}
              onChange={(e) => setNewEntry({...newEntry, syllabus_progress: parseInt(e.target.value)})}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Add Entry</button>
        </form>
      </div>
    </div>
  );

  const renderDiary = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">Work Diary</h1>
        <p className="page-subtitle">Your teaching entries</p>
      </div>

      <div className="content-card">
        {entries.map(entry => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header">
              <div>
                <span className="entry-subject">
                  {entry.subject} - {
                    entry.lectures && entry.lectures.length > 0 
                      ? entry.lectures[0].topic 
                      : (entry.topic || 'No topic')
                  }
                </span>
                <span className="entry-teacher"> - by {entry.author_name} ({entry.author_role})</span>
              </div>
              <span className="entry-date">{new Date(entry.created_at).toLocaleDateString()}</span>
            </div>
            <div className="entry-content">{entry.content || entry.remarks}</div>
            <div className="entry-department">Department: {entry.department}</div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Syllabus Progress</span>
                <span style={{ color: '#d4a843', fontSize: '0.9rem' }}>{entry.syllabus_progress || entry.syllabus_percent}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${entry.syllabus_progress || entry.syllabus_percent}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">College Diary</h2>
          <div className="user-info">
            <div>{user.name}</div>
            <div className="role-badge">{user.role}</div>
          </div>
        </div>

        <ul className="nav-menu">
          <li className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeView === 'add-entry' ? 'active' : ''}`}
              onClick={() => setActiveView('add-entry')}
            >
              Add Entry
            </a>
          </li>
          <li className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeView === 'diary' ? 'active' : ''}`}
              onClick={() => setActiveView('diary')}
            >
              Work Diary
            </a>
          </li>
          {(user.role === 'College Admin' || user.role === 'Principal') && (
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeView === 'users' ? 'active' : ''}`}
                onClick={() => setActiveView('users')}
              >
                User Management
              </a>
            </li>
          )}
        </ul>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'add-entry' && renderAddEntry()}
        {activeView === 'diary' && renderDiary()}
        {activeView === 'users' && (user.role === 'College Admin' || user.role === 'Principal') && (
          <UserManagement apiBaseUrl={apiBaseUrl} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;