import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { BarChart } from '@mui/x-charts/BarChart';
import HeaderAdmin from './HeaderAdmin';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';

import './static/Dashboard.css';
import { rota_base } from '../../constants';
import { ClassNames } from '@emotion/react';


export default function Dashboard() {
  const [casos, setCasos] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [urgenciaData, setUrgenciaData] = useState([]);
  const [turmaData, setTurmaData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("todos");
  const [selectedTurma, setSelectedTurma] = useState("todos");
  const [selectedClass, setSelectedClass] = useState("todos");
  const cookies = new Cookies();
  const token = cookies.get('token');

  useEffect(() => {
    fetch(rota_base +'/casos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    .then(response => {
      console.log("Resposta do servidor:", response)
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      return response.json();
    })
    .then(data => {
      setCasos(data.caso);
      processCaseData(data.caso);
    })
    .catch(error => {
      setError(error.message);
    });
  }, [token]);


  const handleGenerateReport = () => {
    let url = `${rota_base}/casos/relatorio-geral`;

    // Adicionar parâmetros se não forem "todos"
    const params = new URLSearchParams();

    if (selectedYear !== "todos") {
      params.append('ano', selectedYear);
    }
    
    if (selectedTurma !== "todos") {
      if(selectedClass !== "todos"){
        params.append('turma', selectedTurma + selectedClass);
      }
      else{
        params.append('turma', selectedTurma);
      }
    }
    

    // Se houver parâmetros, adicioná-los à URL
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to generate report');
        }
        // Get filename from Content-Disposition header
        const filename = response.headers.get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/["']/g, '');
          
        return response.blob().then(blob => ({
          blob,
          filename
        }));
      })
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'relatorio.xlsx'; // Use the filename from header or fallback
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        alert("Erro ao gerar o relatório: " + error.message);
      });
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleTurmaChange = (event) => {
    setSelectedTurma(event.target.value);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };


  const processCaseData = (casos) => {
    const statusCounts = { 'EM ABERTO': 0, 'FINALIZADO': 0 };
    const urgenciaCounts = { 'ALTA': 0, 'MEDIA': 0, 'BAIXA': 0, 'NAO INFORMADO': 0 };
    const turmaCounts = {};

    casos.forEach(caso => {
      statusCounts[caso.status]++;
      urgenciaCounts[caso.urgencia]++;
      const turma = caso.aluno.turma;
      if (!turmaCounts[turma]) {
        turmaCounts[turma] = 0;
      }
      turmaCounts[turma]++;
    });

    const statusData = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));

    const urgenciaData = Object.keys(urgenciaCounts).map(key => ({
      name: key,
      value: urgenciaCounts[key]
    }));

    const turmaData = Object.keys(turmaCounts).map(key => ({
      name: key,
      value: turmaCounts[key]
    }));

    setStatusData(statusData);
    setUrgenciaData(urgenciaData);
    setTurmaData(turmaData);
    console.log(casos)
  };

  const COLORS = ['#007bff', '#FBD542', '#008000', '#05263E'];

  return (
    <div>
      <HeaderAdmin />
      <Container className='dashboard'>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography
              style={{ 
                fontFamily: 'Roboto, sans-serif', 
                fontWeight: 'bold', 
                textTransform: 'uppercase', 
                color: '#333', 
              }}
            >
              Dashboard
            </Typography>
          </Grid>
          <Grid item xs={4} style={{ textAlign: "center"}}>
            <Button variant="contained" color="primary" onClick={handleGenerateReport}>
              Gerar Relatório
            </Button>
          </Grid>
          <Grid item xs={2} style={{ textAlign: "center"}}>
            <FormControl fullWidth size='small'>
                <InputLabel id="year-select-label">Ano</InputLabel>
                <Select
                    labelId="year-select-label"
                    id="year-select"
                    size='small'

                    value={selectedYear}
                    onChange={handleYearChange}
                    
                >
                  <MenuItem value="todos">Todos</MenuItem>
                     {[...Array(10)].map((_, index) => {
                    const year = dayjs().year() - index;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                      );
                    })}
                </Select>
            </FormControl>
            </Grid>
            <Grid item xs={2} style={{ textAlign: "center"}}>
              <FormControl fullWidth size='small'>
                <InputLabel id="turma-select-label">Turma</InputLabel>
                <Select
                    labelId="turma-select-label"
                    id="turma-select"
                    size='small'
                    value={selectedTurma}
                    onChange={handleTurmaChange}
                    
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2} style={{ textAlign: "center"}}>
              <FormControl fullWidth size='small'>
                <InputLabel id="cls-select-label">Classe</InputLabel>
                <Select
                    labelId="cls-select-label"
                    id="cls-select"
                    size='small'
                    value={selectedClass}
                    onChange={handleClassChange}
                    disabled={selectedTurma === "todos"}
                    
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(cls => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <Typography variant="h6" component="h6" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 'bold' }}>
                Total de Casos: {casos.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <Typography variant="h5" component="h5" style={{ marginBottom: '20px' }}>
                Status dos Casos
              </Typography>
              <PieChart width={300} height={300}>
                <Pie dataKey="value" data={statusData} cx={200} cy={150} outerRadius={80} label={(entry) => entry.name}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend align="center" verticalAlign="bottom" layout="horizontal" iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
              </PieChart>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <Typography variant="h5" component="h5" style={{ marginBottom: '20px' }}>
                Prioridade dos Casos
              </Typography>
              <PieChart width={400} height={300}>
                <Pie dataKey="value" data={urgenciaData} cx={200} cy={150} outerRadius={80} label={({ name }) => name === 'NAO INFORMADO' ? 'N/A' : name}>
                  {urgenciaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend align="center" verticalAlign="bottom" layout="horizontal" iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
              </PieChart>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <Typography variant="h5" component="h5" style={{ marginBottom: '20px' }}>
                Casos por Turma
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: turmaData.map(item => item.name) }]}
                  series={[{ data: turmaData.map(item => item.value) }]}
                  width={600}
                  height={400}
                />
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
