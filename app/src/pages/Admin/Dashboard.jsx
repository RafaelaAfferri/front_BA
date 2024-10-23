import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { BarChart } from '@mui/x-charts/BarChart';
import HeaderAdmin from './HeaderAdmin';
import Cookies from 'universal-cookie';

import './static/Dashboard.css';
import { rota_base } from '../../constants';


export default function Dashboard() {
  const [casos, setCasos] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [urgenciaData, setUrgenciaData] = useState([]);
  const [turmaData, setTurmaData] = useState([]);
  const [error, setError] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get('token');

  useEffect(() => {
    fetch(rota_base,'/casos', {
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
              variant="h4" 
              component="h4" 
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
                <Pie dataKey="value" data={urgenciaData} cx={200} cy={150} outerRadius={80} label={(entry) => entry.name}>
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
