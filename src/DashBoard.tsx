import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TableComponent from './TableComponent';

const Dashboard: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSummaryRequest = async (id: number) => {
        try {
            const response = await fetch(`/api/summary?id=${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSummary(data.summary);
            setIsSidebarOpen(true);
        } catch (error) {
            console.error('Error fetching summary:', error);
            setSummary('Failed to fetch summary. Please try again later.');
        }
    };

    return (
        <div className="dashboard">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                summary={summary}
            />
            <div className="main-content">
                <TableComponent onSummaryRequest={handleSummaryRequest} />
            </div>
        </div>
    );
};

export default Dashboard;