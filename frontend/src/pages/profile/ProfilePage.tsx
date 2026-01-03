import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores';
import { profileService, salaryService } from '../../services';
import type { Profile, Salary } from '../../types';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign,
  Edit, Save, X, FileText, Upload, Download, Trash2,
  Users, Settings, HelpCircle, UserPlus, LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Profile.css';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    await signOut();
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileRes = await profileService.getMyProfile();
      setProfile(profileRes.data.profile);
      setFormData(profileRes.data.profile);

      try {
        const salaryRes = await salaryService.getMySalary();
        setSalary(salaryRes.data.salary);
      } catch (error) {
        console.log('No salary data found');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await profileService.updateProfile(formData);
      await fetchProfileData();
      setIsEditing(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'GENERAL');

      await profileService.uploadDocument(formData);
      await fetchProfileData();
      alert('Document uploaded successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      const response = await profileService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to download document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await profileService.deleteDocument(documentId);
      await fetchProfileData();
      alert('Document deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete document');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <div className="portal-logo">
            <div className="logo-icon">
              <Users size={24} />
            </div>
            <div>
              <h2>HR Portal</h2>
              <p>Admin Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <Briefcase size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/employees" className="nav-item">
            <Users size={18} />
            <span>Employees</span>
          </Link>
          <Link to="/attendance" className="nav-item">
            <Calendar size={18} />
            <span>Attendance</span>
          </Link>
          <a href="#" className="nav-item">
            <UserPlus size={18} />
            <span>Recruitment</span>
          </a>
          <Link to="/salary" className="nav-item">
            <DollarSign size={18} />
            <span>Payroll</span>
          </Link>
          <Link to="/leave" className="nav-item">
            <FileText size={18} />
            <span>Leave</span>
          </Link>
          <Link to="/profile" className="nav-item active">
            <User size={18} />
            <span>Profile</span>
          </Link>
          <Link to="/reports" className="nav-item">
            <FileText size={18} />
            <span>Reports</span>
          </Link>
        </nav>
        <div className="sidebar-divider">
          <span>SYSTEM</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </a>
          <a href="#" className="nav-item">
            <HelpCircle size={18} />
            <span>Support</span>
          </a>
        </nav>
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar-small">
              {user?.profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.profile?.firstName || user?.firstName || 'Admin'}</p>
              <p className="user-role">{user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'HR' ? 'HR Manager' : 'Employee'}</p>
            </div>
          </div>
          <button className="logout-icon-btn" onClick={handleSignOut} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="profile-main">
        <div className="profile-header">
          <h1>Profile</h1>
          <div className="header-actions">
            {!isEditing ? (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <Edit size={18} />
                Edit Profile
              </button>
            ) : (
              <>
                <button className="btn-cancel" onClick={handleCancel}>
                  <X size={18} />
                  Cancel
                </button>
                <button className="btn-save" onClick={handleSave}>
                  <Save size={18} />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-banner">
            <div className="profile-avatar-large">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" />
              ) : (
                <span>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</span>
              )}
            </div>
            <div className="profile-info-header">
              <h2>{profile?.firstName} {profile?.lastName}</h2>
              <p className="designation">{profile?.designation || 'Employee'}</p>
              <p className="department">{profile?.department || 'General'}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="section">
            <h3 className="section-title">Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label><Mail size={16} /> Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-item">
                <label><Phone size={16} /> Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <p>{profile?.phone || '-'}</p>
                )}
              </div>
              <div className="info-item">
                <label><Calendar size={16} /> Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                ) : (
                  <p>{formatDate(profile?.dateOfBirth)}</p>
                )}
              </div>
              <div className="info-item full-width">
                <label><MapPin size={16} /> Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address"
                  />
                ) : (
                  <p>{profile?.address || '-'}</p>
                )}
              </div>
              <div className="info-item">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                ) : (
                  <p>{profile?.city || '-'}</p>
                )}
              </div>
              <div className="info-item">
                <label>State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                ) : (
                  <p>{profile?.state || '-'}</p>
                )}
              </div>
              <div className="info-item">
                <label>Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                ) : (
                  <p>{profile?.country || '-'}</p>
                )}
              </div>
              <div className="info-item">
                <label>ZIP Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.zipCode || ''}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                ) : (
                  <p>{profile?.zipCode || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="section">
            <h3 className="section-title">Job Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label><Briefcase size={16} /> Employee ID</label>
                <p>{user?.employeeId}</p>
              </div>
              <div className="info-item">
                <label>Department</label>
                <p>{profile?.department || '-'}</p>
              </div>
              <div className="info-item">
                <label>Designation</label>
                <p>{profile?.designation || '-'}</p>
              </div>
              <div className="info-item">
                <label><Calendar size={16} /> Joining Date</label>
                <p>{formatDate(profile?.joiningDate)}</p>
              </div>
              <div className="info-item">
                <label>Employment Type</label>
                <p>{profile?.employmentType || '-'}</p>
              </div>
            </div>
          </div>

          {/* Salary Structure - Read Only */}
          {salary && (
            <div className="section">
              <h3 className="section-title">Salary Structure</h3>
              <div className="salary-grid">
                <div className="salary-item">
                  <label><DollarSign size={16} /> Basic Salary</label>
                  <p className="salary-amount">{formatCurrency(salary.basicSalary, salary.currency)}</p>
                </div>
                <div className="salary-item">
                  <label>Allowances</label>
                  <p className="salary-amount positive">{formatCurrency(salary.allowances, salary.currency)}</p>
                </div>
                <div className="salary-item">
                  <label>Deductions</label>
                  <p className="salary-amount negative">{formatCurrency(salary.deductions, salary.currency)}</p>
                </div>
                <div className="salary-item highlight">
                  <label>Net Salary</label>
                  <p className="salary-amount net">{formatCurrency(salary.netSalary, salary.currency)}</p>
                </div>
                <div className="salary-item">
                  <label>Payment Frequency</label>
                  <p>{salary.paymentFrequency}</p>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Documents</h3>
              <button 
                className="btn-upload" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
              >
                <Upload size={16} />
                {uploadingFile ? 'Uploading...' : 'Upload Document'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            {profile?.documents && profile.documents.length > 0 ? (
              <div className="documents-list">
                {profile.documents.map((doc: any) => (
                  <div key={doc.id} className="document-item">
                    <FileText size={20} />
                    <div className="document-info">
                      <p className="document-name">{doc.filename || doc.name}</p>
                      <p className="document-type">{doc.type || doc.documentType}</p>
                    </div>
                    <div className="document-actions">
                      <button 
                        className="btn-icon" 
                        title="Download"
                        onClick={() => handleDownloadDocument(doc.id, doc.filename || doc.name)}
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        className="btn-icon delete" 
                        title="Delete"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-documents">
                <FileText size={48} />
                <p>No documents uploaded yet</p>
                <p className="hint">Upload your documents like ID, certificates, etc.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
