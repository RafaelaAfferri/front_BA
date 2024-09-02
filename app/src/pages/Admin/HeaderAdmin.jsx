import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './static/HeaderAdmin.css';
import logoBranco from '../../components/img/logoBranco.png';
import Logout from '../../functions/Logout';
import HomeIcon from '@mui/icons-material/Home';



const HeaderAdmin = () => {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={logoBranco} alt="Logo" className="logo" />
        <h1>Busca Ativa Escolar</h1>
      </div>
      <nav>
        <ul>
          <li className={getLinkClass('/home')}>
            <Link to="/home">Home</Link>
          </li>
          <li className={getLinkClass('/alunos')}>
            <Link to="/alunos">Alunos</Link>
          </li>
          <li className={getLinkClass('/dashboard')}>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className={getLinkClass('/usuarios')}>
            <Link to="/usuarios">Usuários</Link>
          </li>
          <li>
            <Logout />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default HeaderAdmin;
