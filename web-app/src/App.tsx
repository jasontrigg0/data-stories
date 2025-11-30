import { useState } from 'react';
import './App.css';
import { Menu, X, ChevronRight, Home, User, Settings, Mail, HelpCircle, Newspaper, ChartArea, Sparkles, Shirt, Icon, Vote } from 'lucide-react';
import { football } from '@lucide/lab';
import NewsFeed from './News.tsx';
import ApprovalRatings from './Approval.tsx';
import AILeaderboard from './AILeaderboard.tsx';
import SportsElos from './SportsElos.tsx';
import FantasyFootball from './FantasyFootball.tsx';
import CongressRankings from './CongressRankings.tsx';
import { useSearchParams } from 'react-router-dom';

// Content components for each section
const contentComponents = {
  News: () => (
    <NewsFeed/>
  ),
  Approval: () => (
    <ApprovalRatings/>
  ),
  AI: () => (
    <AILeaderboard/>
  ),
  Sports: () => (
    <SportsElos/>
  ),
  "Fantasy Football": () => (
    <FantasyFootball/>
  ),
  "Congress Rankings": () => (
    <CongressRankings/>
  ),
};

const Football = () => {
      return <Icon iconNode={football} size={20}/>
}

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
    <div className={`${open ? 'w-80' : 'w-20'} transition-all duration-300 bg-white shadow-lg`}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {open ? (
          <h1 className="text-base font-semibold text-gray-800">Data Stories</h1>
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
          icon={Sparkles} 
          label="AI Leaderboard" 
          expanded={open} 
          active={activeSection === 'AI'} 
          onClick={() => setActiveSection('AI')}
        />
        <SidebarItem 
          icon={ChartArea} 
          label="Trump Approval Ratings" 
          expanded={open} 
          active={activeSection === 'Approval'} 
          onClick={() => setActiveSection('Approval')}
        />
        <SidebarItem
          icon={Shirt} 
          label="Sports Elos" 
          expanded={open} 
          active={activeSection === 'Sports'} 
          onClick={() => setActiveSection('Sports')}
        />
        <SidebarItem
          icon={Vote} 
          label="Congress Rankings" 
          expanded={open} 
          active={activeSection === 'Congress Rankings'} 
          onClick={() => setActiveSection('Congress Rankings')}
        />
        <SidebarItem
          icon={Football} 
          label="Fantasy Football" 
          expanded={open} 
          active={activeSection === 'Fantasy Football'} 
          onClick={() => setActiveSection('Fantasy Football')}
        />
        <SidebarItem 
          icon={Newspaper} 
          label="News + Prediction Markets" 
          expanded={open} 
          active={activeSection === 'News'} 
          onClick={() => setActiveSection('News')}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("tab") || "AI";

  const setActiveSection = (tabId) => {
    setSearchParams({ tab: tabId });
  };

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
