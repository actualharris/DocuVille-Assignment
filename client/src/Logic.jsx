import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Logic() {
    const [imageUrl, setImageUrl] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleExtract = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:3000/api/extract', { imageUrl });
            setData(response.data);
        } catch (error) {
            setError('Error extracting data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (imageUrl) {
            handleExtract(imageUrl);
        }
    }, []);

    return (
        <div className="container">
            <input 
                className="input"
                type="text" 
                placeholder="Enter image URL" 
                required 
                autoFocus
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
            />
            <button className="button" onClick={handleExtract}>Extract Data</button>

            {loading && <p className="loading">Loading...</p>}

            {error && <p className="error">{error}</p>}

            {data && (
                <div>
                    <p>Name: {data.name}</p>
                    <p>Document Number: {data.documentId}</p>
                    <p>Expiration Date: {data.expirationDate}</p>
                </div>
            )}
        </div>
    );
}

export default Logic;