import React, { useEffect, useState } from 'react';
import './TableComponent.css';

interface DataItem {
    id: number;
    source: string;
    title: string;
    time: string;
    tags: string; 
    link: string;
    score: number;
}

interface ApiResponse {
    items: DataItem[];
    has_more: boolean;
}

interface TableComponentProps {
    onSummaryRequest: (id: number) => void;
}

const TableComponent: React.FC<TableComponentProps> = ({ onSummaryRequest }) => {
    const [data, setData] = useState<DataItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const limit = 10;

    useEffect(() => {
        fetch(`/api/newspapers?limit=${limit}&page=${page}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data: ApiResponse) => {
                setData(data.items);
                setHasMore(data.has_more);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again later.');
            });
    }, [page]);

    const handleRowClick = (id: number, link: string) => {
        window.open(link, '_blank');
        onSummaryRequest(id);
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
                style={{ marginRight: '5px', padding: '5px', backgroundColor: 'gray', color: 'white' }}
            >
                Previous
            </button>
        );

        if (page > 2) {
            buttons.push(
                <button
                    key="page-1"
                    onClick={() => handlePageClick(1)}
                    style={{ marginRight: '5px', padding: '5px', backgroundColor: 'gray', color: 'white' }}
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
                    style={{ marginRight: '5px', padding: '5px', backgroundColor: 'gray', color: 'white' }}
                >
                    2
                </button>
            );
        }

        buttons.push(
            <button
                key={`page-${page + 1}`}
                style={{ marginRight: '5px', padding: '5px', backgroundColor: 'blue', color: 'white' }}
            >
                {page + 1}
            </button>
        );

        buttons.push(
            <button
                key="next"
                onClick={handleNextPage}
                disabled={!hasMore}
                style={{ padding: '5px', backgroundColor: 'gray', color: 'white' }}
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
                        <th>Title</th>
                        <th>Time</th>
                        <th>Tags</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.source}</td>
                            <td className="clickable" onClick={() => handleRowClick(item.id, item.link)}>{item.title}</td>
                            <td>{item.time}</td>
                            <td>{item.tags}</td>
                            <td>{item.score.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {renderPageButtons()}
            </div>
        </div>
    );
};

export default TableComponent;
