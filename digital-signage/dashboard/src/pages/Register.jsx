import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserPlus } from 'react-icons/fa';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <FaUserPlus className="register-icon" />
          <h1>Criar Conta</h1>
          <p>Preencha os dados para se cadastrar</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Já tem uma conta?{' '}
            <Link to="/login">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
