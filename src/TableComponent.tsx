import React, { useEffect, useState, useRef, useCallback } from 'react';
import './TableComponent.css';

interface DataItem {
    id: number;
    source: string;
    title: string;
    time: string;
    tags: string;
    link: string;
    score: number;
    summary: string;
}

interface ApiResponse {
    items: DataItem[];
    has_more: boolean;
}

const TableComponent: React.FC = () => {
    const [data, setData] = useState<DataItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editInstruction, setEditInstruction] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const limit = 5;

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/newspapers?limit=${limit}&page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result: ApiResponse = await response.json();
            setData(result.items);
            setHasMore(result.has_more);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again later.');
        }
    }, [page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                closePopup();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handlePostToTwitter = async (id: number, summary: string, link: string, tags: string) => {
        const hashtags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).map(tag => `#${tag}`).join(' ');
        const tweetContent = `${summary}${hashtags}\n${link}`;
        if (window.confirm(`Do you want to post the following tweet?\n\n${tweetContent}`)) {
            try {
                const response = await fetch(import.meta.env.VITE_API_URL + '/post-to-twitter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, content: tweetContent }),
                });
                const data = await response.json();
                if (data.success) {
                    alert('Successfully posted to Twitter!');
                } else {
                    alert('Failed to post to Twitter. Please try again.');
                }
            } catch (error) {
                console.error('Error posting to Twitter:', error);
                alert('An error occurred while posting to Twitter.');
            }
        }
    };

    const handleTextSelection = (itemId: number, originalText: string) => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setEditingText(originalText);
            setPopupPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            });
            setEditingItemId(itemId);
            setIsEditing(true);
        } else {
            closePopup();
        }
    };

    const closePopup = () => {
        setPopupPosition(null);
        setEditingItemId(null);
        setIsEditing(false);
    };

    const handleEditConfirm = () => {
        if (editingItemId !== null) {
            setData(prevData =>
                prevData.map(item =>
                    item.id === editingItemId
                        ? { ...item, summary: editingText }
                        : item
                )
            );
            closePopup();
        }
    };
    const handleGeminiEdit = async () => {
        if (editingItemId !== null && editInstruction.trim() !== '') {
            setIsLoading(true);
            try {
                const response = await fetch(import.meta.env.VITE_API_URL + '/edit-summary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: editingItemId,
                        summary: editingText,
                        instruction: editInstruction,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to edit summary');
                }

                const result = await response.json();
                setEditingText(result.editedSummary);
            } catch (error) {
                console.error('Error editing summary:', error);
                alert('An error occurred while editing the summary.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const renderSummary = (summary: string) => {
        return summary.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < summary.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    const handleTextDecrease = async () => {
        if (editingItemId !== null) {
            setIsLoading(true);
            try {
                const response = await fetch(import.meta.env.VITE_API_URL + '/decrease-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: editingItemId,
                        summary: editingText,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to edit summary');
                }

                const result = await response.json();
                setEditingText(result.decreaseSummary);
            } catch (error) {
                console.error('Error editing summary:', error);
                alert('An error occurred while editing the summary.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleTextIncrease = async () => {
        if (editingItemId !== null) {
            setIsLoading(true);
            try {
                const response = await fetch(import.meta.env.VITE_API_URL + '/increase-summary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        summary_text: editingText,
                        expansion: 10,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to increase summary');
                }

                const result = await response.json();
                setEditingText(result.increasedSummary);
            } catch (error) {
                console.error('Error increasing summary:', error);
                alert('An error occurred while increasing the summary.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleInsertBelow = () => {
        console.log("Insert below button clicked");
        closePopup();
    };

    const handleNextPage = () => {
        if (hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const handlePageClick = (pageNumber: number) => {
        setPage(pageNumber - 1);
    };

    const renderPageButtons = () => {
        const buttons = [];

        buttons.push(
            <button
                key="previous"
                onClick={handlePreviousPage}
                disabled={page === 0}
                className="pagination-button"
            >
                Previous
            </button>
        );

        if (page > 2) {
            buttons.push(
                <button
                    key="page-1"
                    onClick={() => handlePageClick(1)}
                    className="pagination-button"
                >
                    1
                </button>
            );
        }

        if (page > 1) {
            buttons.push(
                <button
                    key="page-2"
                    onClick={() => handlePageClick(2)}
                    className="pagination-button"
                >
                    2
                </button>
            );
        }

        buttons.push(
            <button
                key={`page-${page + 1}`}
                className="pagination-button active"
            >
                {page + 1}
            </button>
        );

        buttons.push(
            <button
                key="next"
                onClick={handleNextPage}
                disabled={!hasMore}
                className="pagination-button"
            >
                Next
            </button>
        );

        return buttons;
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Source</th>
                        <th>Time</th>
                        <th className="title-column">Title</th>
                        <th className="summary-column">Summary</th>
                        <th>Actions</th>
                        <th>Score</th>
                        <th>Tags</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.source}</td>
                            <td>{item.time}</td>
                            <td className="clickable title-column">
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {item.title.length > 50 ? `${item.title.substring(0, 50)}...` : item.title}
                                </a>
                            </td>

                            <td
                                className="summary-column"
                                onMouseUp={() => handleTextSelection(item.id, item.summary)}
                            >
                                <div className="summary-content">
                                    {renderSummary(item.summary)}
                                </div>
                            </td>
                            <td>
                                <button onClick={() => {
                                    handlePostToTwitter(item.id, item.summary, item.link, item.tags);
                                }} className="tweet-button">Tweet</button>
                            </td>
                            <td>{item.score.toFixed(1)}</td>
                            <td>{item.tags}</td>


                        </tr>
                    ))}
                </tbody>
            </table>
            {isEditing && popupPosition && (
                <div
                    ref={popupRef}
                    className="edit-popup"
                    style={{
                        position: 'absolute',
                        top: popupPosition.top,
                        left: popupPosition.left
                    }}
                >
                    <h3>Edit Summary</h3>
                    <div className="edit-controls">
                        <button onClick={handleTextDecrease}>文章を減らす</button>
                        <button onClick={handleTextIncrease}>文章を増やす</button>
                    </div>
                    <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={5}
                    />
                    <div className="gemini-edit">
                        <input
                            type="text"
                            value={editInstruction}
                            onChange={(e) => setEditInstruction(e.target.value)}
                            placeholder="Enter edit instruction for Gemini"
                            className="gemini-input"
                        />
                        <button
                            onClick={handleGeminiEdit}
                            disabled={isLoading}
                            className="gemini-button"
                        >
                            {isLoading ? 'Editing...' : 'Edit with Gemini'}
                        </button>
                    </div>
                    <div className="edit-actions">
                        <button onClick={handleEditConfirm}>切り替え</button>
                        <button onClick={handleInsertBelow}>以下挿入</button>
                        <button onClick={() => {
                            if (editingItemId !== null) {
                                const item = data.find(i => i.id === editingItemId);
                                if (item) {
                                    handlePostToTwitter(item.id, editingText, item.link, item.tags);
                                }
                            }
                        }} className="tweet-button">Tweet</button>
                    </div>
                </div>
            )}

            <div className="pagination">
                {renderPageButtons()}
            </div>
        </div>
    );
};

export default TableComponent;