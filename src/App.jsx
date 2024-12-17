import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [sortOption, setSortOption] = useState('name');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;

      setLoading(true);
      setError('');
      try {
        const response = await axios.get('https://api.rawg.io/api/games', {
          params: {
            key: 'b62ed153af154bb7a8d42380b4961826',
            page: page,
            page_size: 40,
          },
        });

        const newGames = response.data.results;

        setData((prevData) => {
          const combinedData = [...prevData, ...newGames];
          const uniqueData = Array.from(
            new Map(combinedData.map((game) => [game.id, game])).values()
          );
          return uniqueData;
        });

        if (newGames.length < 40) setHasMore(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const filteredData = data
    .filter((game) =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((game) =>
      filterPlatform === 'all' ||
      game.parent_platforms?.some((p) => p.platform.slug === filterPlatform)
    )
    .sort((a, b) => {
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      if (sortOption === 'release') return new Date(a.released) - new Date(b.released);
      if (sortOption === 'rating') return b.rating - a.rating;
      return 0;
    });

  const loadMore = () => setPage((prevPage) => prevPage + 1);

  const closeModal = () => setSelectedGame(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pixel Picks</h1>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <select
            className="filter-dropdown"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="pc">PC</option>
            <option value="playstation">PlayStation</option>
            <option value="xbox">Xbox</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
          </select>
          <select
            className="sort-dropdown"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="release">Sort by Release Date</option>
            <option value="rating">Sort by Rating</option>
          </select>
          <p className="games-count">Showing {filteredData.length} games</p>

        </div>
      </header>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="cards-container">
        {filteredData.map((game) => (
          <div
            key={game.id}
            className="card"
            onClick={() => setSelectedGame(game)}
          >
            <div className="card-image">
              <img src={game.background_image} alt={game.name} />
            </div>
            <div className="card-details">
              <h3>{game.name}</h3>
              <p>Released: {game.released}</p>
              <p>Rating: {game.rating}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedGame && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <h2>{selectedGame.name}</h2>
            <img
              src={selectedGame.background_image}
              alt={selectedGame.name}
              className="modal-image"
            />
            <p><strong>Release Date:</strong> {selectedGame.released}</p>
            <p><strong>Rating:</strong> {selectedGame.rating}</p>
            <p>
              <strong>More Info:</strong>{' '}
              <a
                href={`https://rawg.io/games/${selectedGame.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on RAWG
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
