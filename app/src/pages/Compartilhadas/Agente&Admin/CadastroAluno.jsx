// Importa os módulos necessários do React, Material-UI, universal-cookie, react-router-dom, e ícones
import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Grid, Input } from '@mui/material';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HeaderAdmin from '../../Admin/HeaderAdmin';
import HeaderAgente from '../../Agente/HeaderAgente';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { rota_base } from '../../../constants';

// Ative o plugin
dayjs.extend(customParseFormat);

// Inicializa o objeto de cookies
const cookies = new Cookies();



// Componente funcional CadastroAluno
const CadastroAluno = () => {
  // Recupera o token e a permissão do usuário armazenados nos cookies
  const token = cookies.get('token');
  const permissao = cookies.get('permissao');
  
  // Hook de navegação do React Router
  const navigate = useNavigate();

  // Estado para armazenar o arquivo Excel selecionado
  const [file, setFile] = useState(null);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  //envio do arquivo
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita o recarregamento da página

    if (!file) {
      alert('Por favor, selecione um arquivo Excel para enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Envia o arquivo para a API usando fetch
      const response = await fetch(rota_base + '/alunoBuscaAtiva', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      console.log('Cadastro realizado com sucesso:', data);
      alert('Cadastro realizado com sucesso');

      // Redireciona para a página de alunos após o envio bem-sucedido
      navigate('/alunos');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao realizar cadastro');
    }
  };

  return (
    <div>
      {/* Renderiza o cabeçalho apropriado com base na permissão do usuário */}
      {permissao === 'AGENTE' ? <HeaderAgente /> : <HeaderAdmin />}
      <br />
      <div className='geral'>
        <Grid container spacing={2} className="login-container">
          <Grid item xs={1} style={{paddingLeft:"40px", paddingTop:"3%" }}>
            <Link to="/usuarios" style={{ textDecoration: 'none', color:"#007bff" }}>
              <ArrowBackIcon className="back-arrow" />
            </Link>
          </Grid>
          <Grid item xs={10} style={{ textAlign: 'center' }}>
            <Container maxWidth="md">
              <Box component="form" onSubmit={handleSubmit} className="form-container">
                <Typography component="h1" variant="h5" className="form-title">
                  Cadastro de Alunos
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                  <input
                      style={{ display: 'none' }}
                      type="file"
                      accept=".xlsx, .xls"
                      id="upload-file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="upload-file">
                      <Button variant="outlined" component="span" fullWidth sx={{ mt: 2, mb: 2 }}>
                        {file ? file.name : 'Selecionar Arquivo'}
                      </Button>
                    </label>
                  </Grid>
                  <Grid item xs={6} sm={6}>
                      <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      className="form-button"
                      sx={{ mt: 2, mb: 2 }}
                      >
                      Enviar Arquivo
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Grid>
        </Grid>
      </div>
      <br/>
    </div>
  );
};

// Exporta o componente para uso em outras partes da aplicação
export default CadastroAluno;
