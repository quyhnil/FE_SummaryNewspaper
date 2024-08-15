import React, { useState } from 'react';
import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    summary: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, summary }) => {
    const [copySuccess, setCopySuccess] = useState<string>('');

    const copyToClipboard = async () => {
        if (summary) {
            try {
                await navigator.clipboard.writeText(summary);
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000); 
            } catch (err) {
                setCopySuccess('Failed to copy');
                console.error('Failed to copy text: ', err);
            }
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isOpen ? 'Close' : 'Open'}
            </button>
            <div className="content">
                {summary ? (
                    <div>
                        <h3>Summary</h3>
                        <p>{summary}</p>
                        <button onClick={copyToClipboard} className="copy-btn">
                            Copy Summary
                        </button>
                        {copySuccess && <span className="copy-message">{copySuccess}</span>}
                    </div>
                ) : (
                    <p>Select an article to view its summary</p>
                )}
            </div>
        </div>
    );
};

export default Sidebar;