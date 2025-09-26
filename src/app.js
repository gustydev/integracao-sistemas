require('dotenv').config();

const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor Express funcionando!');
});

app.get(`/api/clima/:cep`, async(req, res) => {
  const fetchDados = await fetch(`https://cep.awesomeapi.com.br/json/${req.params.cep}`);
  const dados = await fetchDados.json();

  const [latitude, longitude] = [dados.lat, dados.lng]

  const fetchMeteo = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation,relative_humidity_2m,apparent_temperature,rain,showers,surface_pressure,pressure_msl,cloud_cover`)
  const clima = await fetchMeteo.json();

  console.log(clima)

  const local = {
    cep: dados.cep,
    endereço: dados.address,
    cidade: `${dados.city}, ${dados.state}`,
  }

  res.json(local);
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});