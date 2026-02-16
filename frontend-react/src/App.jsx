import React, { useState, createContext, useContext, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Brain, Mic, Camera, Upload, TrendingUp, History, TestTube } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary'; // Assuming you created this
// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const TestingLabs = React.lazy(() => import('./components/TestingLabs'));
import './App.css';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="spinner"></div>
    </div>
);

function App() {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'dark';
    });

    const [activeTab, setActiveTab] = useState('dashboard');
    const [userName, setUserName] = useState(() => {
        const saved = localStorage.getItem('userName');
        return saved || 'Alex';
    });
    const [mode, setMode] = useState('Work');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('userName', userName);
    }, [userName]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className="app">
                {/* Sidebar */}
                <motion.aside
                    className="sidebar"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                >
                    <div className="sidebar-header">
                        <motion.div
                            className="logo"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Brain size={40} />
                            <h2>Wellbeing AI</h2>
                        </motion.div>
                    </div>

                    <div className="sidebar-content">
                        <div className="user-section">
                            <label>Name</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div className="mode-section">
                            <label>Current Mode</label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                                className="select-field"
                            >
                                <option>Work</option>
                                <option>Study</option>
                                <option>Chill</option>
                                <option>Meeting</option>
                            </select>
                        </div>

                        <div className="settings-section">
                            <h3>⚙️ Settings</h3>
                            <motion.button
                                className="theme-toggle"
                                onClick={toggleTheme}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.aside>

                {/* Main Content */}
                <main className="main-content">
                    {/* Header */}
                    <motion.header
                        className="header"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="header-content">
                            <h1>Hello, {userName}! 👋</h1>
                            <p><strong>Mode:</strong> {mode} | <strong>Status:</strong> Ready to assist</p>
                        </div>
                    </motion.header>

                    {/* Tabs */}
                    <motion.div
                        className="tabs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <button
                            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <TrendingUp size={18} />
                            Wellbeing Dashboard
                        </button>
                        <button
                            className={`tab ${activeTab === 'labs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('labs')}
                        >
                            <TestTube size={18} />
                            Testing Labs
                        </button>
                    </motion.div>

                    {/* Tab Content with Error Boundary and Suspense */}

                    <ErrorBoundary>
                        <Suspense fallback={<LoadingSpinner />}>
                            <AnimatePresence mode="wait">
                                {activeTab === 'dashboard' ? (
                                    <Dashboard key="dashboard" userName={userName} />
                                ) : (
                                    <TestingLabs key="labs" />
                                )}
                            </AnimatePresence>
                        </Suspense>
                    </ErrorBoundary>

                </main>
            </div>
        </ThemeContext.Provider>
    );
}

export default App;
