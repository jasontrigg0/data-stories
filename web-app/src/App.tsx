import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NewsFeed from './News.tsx'
import { Menu, X, ChevronRight, Home, User, Settings, Mail, HelpCircle } from 'lucide-react';

// Content components for each section
const contentComponents = {
  News: () => (
    <NewsFeed/>
  ),
  Profile: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">User Profile</h1>
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 overflow-hidden rounded-full bg-gray-200">
            <div className="flex items-center justify-center h-full text-gray-700 text-3xl font-medium">JD</div>
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-800">John Doe</h2>
            <p className="text-gray-600">john.doe@example.com</p>
            <p className="text-gray-500">Member since: January 2025</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-gray-700">John Doe</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-700">john.doe@example.com</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-gray-700">San Francisco, CA</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-gray-700">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  Messages: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Messages</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex-shrink-0">
                <div className="flex items-center justify-center h-full text-gray-700 font-medium">U{item}</div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <h3 className="text-gray-800 font-medium">User {item}</h3>
                  <span className="text-sm text-gray-500">12:00 PM</span>
                </div>
                <p className="text-gray-600 text-sm">This is a sample message preview. Click to read more...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  Settings: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Settings</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-medium text-gray-800">Account Settings</h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-gray-700 font-medium mb-2">Notification Preferences</h3>
            <div className="flex items-center mb-2">
              <input type="checkbox" id="email-notif" className="mr-2" />
              <label htmlFor="email-notif" className="text-gray-600">Email Notifications</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="push-notif" className="mr-2" />
              <label htmlFor="push-notif" className="text-gray-600">Push Notifications</label>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-gray-700 font-medium mb-2">Theme</h3>
            <div className="flex items-center">
              <input type="radio" name="theme" id="light" className="mr-2" checked />
              <label htmlFor="light" className="text-gray-600 mr-4">Light</label>
              <input type="radio" name="theme" id="dark" className="mr-2" />
              <label htmlFor="dark" className="text-gray-600">Dark</label>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  ),
  Help: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Help & Support</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Frequently Asked Questions</h2>
        {[1, 2, 3].map((item) => (
          <div key={item} className="mb-4 border-b pb-4">
            <h3 className="font-medium text-gray-800 mb-2">Question {item}?</h3>
            <p className="text-gray-600">This is a sample answer to the question. It provides helpful information for users who are looking for assistance.</p>
          </div>
        ))}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Need more help?</h2>
          <p className="text-gray-600 mb-4">Contact our support team for additional assistance.</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
};

const SidebarItem = ({ icon: Icon, label, expanded, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      <Icon size={20} />
      {expanded && <span className="ml-4">{label}</span>}
    </button>
  );
}

const Sidebar = ({open, activeSection, setActiveSection, toggleSidebar}) => {
  return (
    <div className={`${open ? 'w-64' : 'w-20'} transition-all duration-300 bg-white shadow-lg`}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {open ? (
          <h1 className="text-base font-semibold text-gray-800">Data Site</h1>
        ) : (
          <div className="w-full flex justify-center">
            <h1 className="text-xl font-semibold text-gray-800"></h1>
          </div>
        )}
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
          <ChevronRight className={`${open ? 'rotate-180' : 'rotate-0'} transition-all duration-300`} size={20} />
        </button>
      </div>

      <nav className="mt-6">
        <SidebarItem 
          icon={Home} 
          label="News" 
          expanded={open} 
          active={activeSection === 'News'} 
          onClick={() => setActiveSection('News')}
        />
        <SidebarItem 
          icon={User} 
          label="Profile" 
          expanded={open} 
          active={activeSection === 'Profile'} 
          onClick={() => setActiveSection('Profile')}
        />
        <SidebarItem 
          icon={Mail} 
          label="Messages" 
          expanded={open} 
          active={activeSection === 'Messages'} 
          onClick={() => setActiveSection('Messages')}
        />
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          expanded={open} 
          active={activeSection === 'Settings'} 
          onClick={() => setActiveSection('Settings')}
        />
        <SidebarItem 
          icon={HelpCircle} 
          label="Help" 
          expanded={open} 
          active={activeSection === 'Help'} 
          onClick={() => setActiveSection('Help')}
        />
      </nav>
    </div>
  )
}     

const NavBar = ({open, toggleSidebar, activeSection}) => {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b shadow-sm">
      <div className="flex items-center">
        <button className="text-gray-500 hover:text-gray-700 md:hidden" onClick={toggleSidebar}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h2 className="ml-4 text-lg font-medium text-gray-800">{activeSection}</h2>
      </div>
    </header>
  )
}     

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('News');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen w-8xl bg-gray-50">
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} activeSection={activeSection} setActiveSection={setActiveSection}/>
      <div className="flex flex-col flex-1 overflow-hidden">
        <NavBar open={sidebarOpen} toggleSidebar={toggleSidebar} activeSection={activeSection}/>
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="max-w-4xl">
            {contentComponents[activeSection]()}
          </div>
        </main>        
      </div>
    </div>
  )
}

export default App
