import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DepartmentReports = ({ user, apiBaseUrl }) => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherEntries, setTeacherEntries] = useState([]);
  const [teacherStats, setTeacherStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartmentTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm]);

  const fetchDepartmentTeachers = async () => {
    try {
      setLoading(true);
      console.log('Fetching department teachers from:', `${apiBaseUrl}/users/department-teachers`);
      
      const response = await axios.get(`${apiBaseUrl}/users/department-teachers`);
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      const teachers = response.data.users || [];
      console.log('Department teachers:', teachers);
      
      setTeachers(teachers);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      console.error('Error details:', error.response);
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = [...teachers];

    // Search by name or email
    if (searchTerm) {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTeachers(filtered);
  };

  const fetchTeacherDetails = async (teacherId) => {
    try {
      setLoading(true);
      // Fetch teacher's entries
      const entriesResponse = await axios.get(`${apiBaseUrl}/entries/?user_id=${teacherId}`);
      const entries = entriesResponse.data.entries || [];
      setTeacherEntries(entries);

      // Calculate comprehensive stats
      const totalEntries = entries.length;
      
      // This month's stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      });

      // This week's stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekEntries = entries.filter(entry => 
        new Date(entry.created_at) >= oneWeekAgo
      );

      // Subject-wise analysis
      const subjectProgress = {};
      const subjectTopicsCount = {};
      
      entries.forEach(entry => {
        const subject = entry.subject;
        if (!subjectProgress[subject]) {
          subjectProgress[subject] = {
            topics: new Set(),
            entries: 0,
            totalHours: 0
          };
        }
        
        subjectProgress[subject].entries++;
        subjectProgress[subject].totalHours += 50/60; // 50 minutes per entry
        
        // Add covered topics
        if (entry.lectures && entry.lectures.length > 0) {
          entry.lectures.forEach(lecture => {
            if (lecture.topic) {
              subjectProgress[subject].topics.add(lecture.topic);
            }
          });
        }
      });

      // Calculate subject stats with available topics
      const subjectStats = Object.keys(subjectProgress).map(subject => {
        const availableTopics = getAvailableTopics(subject);
        const coveredTopics = subjectProgress[subject].topics.size;
        const completionRate = availableTopics.length > 0 
          ? Math.round((coveredTopics / availableTopics.length) * 100)
          : 0;

        return {
          subject,
          coveredTopics,
          totalTopics: availableTopics.length,
          completionRate,
          entries: subjectProgress[subject].entries,
          hours: Math.round(subjectProgress[subject].totalHours * 10) / 10
        };
      });

      const avgProgress = subjectStats.length > 0 
        ? Math.round(subjectStats.reduce((sum, s) => sum + s.completionRate, 0) / subjectStats.length)
        : 0;

      setTeacherStats({
        totalEntries,
        thisMonthEntries: thisMonthEntries.length,
        thisWeekEntries: thisWeekEntries.length,
        thisMonthHours: Math.round((thisMonthEntries.length * 50) / 60 * 10) / 10,
        avgProgress,
        subjectStats,
        lastEntryDate: entries.length > 0 ? new Date(entries[0].created_at).toLocaleDateString() : 'No entries'
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch teacher details:', error);
      setLoading(false);
    }
  };

  // Helper function to get available topics for a subject
  const getAvailableTopics = (subject) => {
    const subjectTopics = {
      'Programming': ['Variables & Data Types', 'Control Structures', 'Functions', 'Object-Oriented Programming', 'Exception Handling'],
      'Database': ['SQL Basics', 'Database Design', 'Normalization', 'Joins', 'Stored Procedures'],
      'Networks': ['OSI Model', 'TCP/IP', 'Routing', 'Network Security', 'Wireless Networks'],
      'Algorithms': ['Sorting Algorithms', 'Searching Algorithms', 'Graph Algorithms', 'Dynamic Programming', 'Complexity Analysis'],
      'Software Engineering': ['SDLC Models', 'Requirements Analysis', 'System Design', 'Testing', 'Project Management'],
      'Data Structures': ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Hash Tables'],
      'Operating Systems': ['Process Management', 'Memory Management', 'File Systems', 'CPU Scheduling', 'Deadlocks'],
      
      // Add other department subjects as needed
      'Digital Electronics': ['Logic Gates', 'Boolean Algebra', 'Flip Flops', 'Counters', 'Memory Devices'],
      'Analog Electronics': ['Diodes', 'Transistors', 'Amplifiers', 'Oscillators', 'Op-Amps'],
      'Power Systems': ['Power Generation', 'Transmission Lines', 'Distribution Systems', 'Load Flow Analysis', 'Protection Systems'],
      'Electrical Machines': ['DC Motors', 'AC Motors', 'Transformers', 'Generators', 'Motor Control'],
      'Thermodynamics': ['Laws of Thermodynamics', 'Heat Engines', 'Refrigeration', 'Steam Tables', 'Gas Cycles'],
      'Fluid Mechanics': ['Fluid Properties', 'Fluid Statics', 'Flow Measurement', 'Pumps', 'Turbines'],
      'Structural Engineering': ['Beam Analysis', 'Column Design', 'Foundation Design', 'Steel Structures', 'Concrete Design'],
      'Geotechnical Engineering': ['Soil Properties', 'Foundation Engineering', 'Slope Stability', 'Earth Pressure']
    };
    
    return subjectTopics[subject] || [];
  };

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
    fetchTeacherDetails(teacher.id);
  };

  const getActivityStatus = (lastEntryDate, thisWeekEntries) => {
    if (thisWeekEntries > 0) return { status: 'Active', color: '#059669' };
    if (lastEntryDate === 'No entries') return { status: 'No Activity', color: '#dc2626' };
    
    const daysSinceLastEntry = Math.floor((new Date() - new Date(lastEntryDate)) / (1000 * 60 * 60 * 24));
    if (daysSinceLastEntry <= 7) return { status: 'Recent', color: '#d97706' };
    return { status: 'Inactive', color: '#dc2626' };
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Department Reports</h1>
        <p className="page-subtitle">{user.department} - Teachers Performance Overview</p>
      </div>

      <div className="form-row" style={{ gap: '1.5rem', alignItems: 'stretch' }}>
        {/* Enhanced Teachers List */}
        <div className="content-card" style={{ flex: '1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title">Teachers ({filteredTeachers.length})</h2>
            <button 
              onClick={fetchDepartmentTeachers}
              style={{
                background: '#d4a843',
                color: '#0f1117',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Refresh
            </button>
          </div>

          {/* Search Only */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              Loading teachers...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              {teachers.length === 0 ? (
                <div>
                  <p>No teachers found in {user.department} department</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Debug: Check browser console (F12) for detailed logs
                  </p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#d4a843' }}>
                    Current user: {user.name} ({user.role}) - {user.department}
                  </p>
                </div>
              ) : (
                'No teachers match your search'
              )}
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              {filteredTeachers.map(teacher => {
                const activityStatus = teacherStats && selectedTeacher?.id === teacher.id 
                  ? getActivityStatus(teacherStats.lastEntryDate, teacherStats.thisWeekEntries)
                  : { status: 'Unknown', color: '#9ca3af' };

                return (
                  <div
                    key={teacher.id}
                    onClick={() => handleTeacherClick(teacher)}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      background: selectedTeacher?.id === teacher.id ? '#2a2d3a' : '#1a1d26',
                      border: `1px solid ${selectedTeacher?.id === teacher.id ? '#d4a843' : '#2a2d3a'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#e8e9ed', fontWeight: '600' }}>{teacher.name}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{teacher.email}</div>
                        <div style={{ color: '#d4a843', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {teacher.department}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {selectedTeacher?.id === teacher.id && (
                          <div style={{ 
                            color: activityStatus.color, 
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {activityStatus.status}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Teacher Details */}
        <div className="content-card" style={{ flex: '2' }}>
          {selectedTeacher ? (
            <>
              <h2 className="card-title">{selectedTeacher.name}'s Progress</h2>
              
              {teacherStats && (
                <>
                  {/* Stats Cards */}
                  <div className="stats-grid" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                    <div className="stat-card">
                      <div className="stat-value">{teacherStats.totalEntries}</div>
                      <div className="stat-label">Total Entries</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{teacherStats.avgProgress}%</div>
                      <div className="stat-label">Avg Syllabus Progress</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{teacherStats.subjectStats.length}</div>
                      <div className="stat-label">Subjects Taught</div>
                    </div>
                  </div>

                  {/* Subject-wise Progress */}
                  <h3 style={{ color: '#d4a843', marginBottom: '1rem', fontSize: '1.1rem' }}>
                    Subject-wise Progress
                  </h3>
                  {teacherStats.subjectStats.map(stat => (
                    <div key={stat.subject} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#e8e9ed' }}>{stat.subject}</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                          {stat.entries} entries - {stat.completionRate}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${stat.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}

                  {/* Recent Entries */}
                  <h3 style={{ color: '#d4a843', marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
                    Recent Entries
                  </h3>
                  {teacherEntries.slice(0, 5).map(entry => (
                    <div key={entry.id} className="entry-card" style={{ marginBottom: '0.75rem' }}>
                      <div className="entry-header">
                        <span className="entry-subject">
                          {entry.subject} - {
                            entry.lectures && entry.lectures.length > 0 
                              ? entry.lectures[0].topic 
                              : 'No topic'
                          }
                        </span>
                        <span className="entry-date">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="entry-content" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {entry.remarks || 'No content'}
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div className="progress-bar" style={{ height: '6px' }}>
                          <div 
                            className="progress-fill" 
                            style={{ width: `${entry.syllabus_percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#9ca3af',
              fontSize: '1.1rem'
            }}>
              Select a teacher to view their progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentReports;