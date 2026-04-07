import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { screenService, contentService, playlistService } from '../../services/api';
import { FaTv, FaFileImage, FaList, FaSignOutAlt } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    screens: 0,
    contents: 0,
    playlists: 0,
    onlineScreens: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [screensData, contentsData, playlistsData] = await Promise.all([
        screenService.getAll(),
        contentService.getAll(),
        playlistService.getAll()
      ]);

      setStats({
        screens: screensData.total || 0,
        contents: contentsData.total || 0,
        playlists: playlistsData.total || 0,
        onlineScreens: screensData.screens?.filter(s => s.status === 'online').length || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Digital Signage</h1>
          <nav className="main-nav">
            <a href="#screens" className="nav-link"><FaTv /> Telas</a>
            <a href="#content" className="nav-link"><FaFileImage /> Conteúdo</a>
            <a href="#playlists" className="nav-link"><FaList /> Playlists</a>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-info">Olá, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon screens">
              <FaTv />
            </div>
            <div className="stat-info">
              <h3>{stats.screens}</h3>
              <p>Telas Cadastradas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon online">
              <FaTv />
            </div>
            <div className="stat-info">
              <h3>{stats.onlineScreens}</h3>
              <p>Telas Online</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon contents">
              <FaFileImage />
            </div>
            <div className="stat-info">
              <h3>{stats.contents}</h3>
              <p>Arquivos de Mídia</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon playlists">
              <FaList />
            </div>
            <div className="stat-info">
              <h3>{stats.playlists}</h3>
              <p>Playlists</p>
            </div>
          </div>
        </div>

        <section className="content-section">
          <h2>Visão Geral</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Status do Sistema</h3>
              <div className="status-indicator">
                <span className="status-dot online"></span>
                <span>Sistema Operacional</span>
              </div>
            </div>
            
            <div className="overview-card">
              <h3>Última Atualização</h3>
              <p>{new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
