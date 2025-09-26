require('dotenv').config();
const codes = require('./data/weatherCodes')
const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor Express funcionando!');
});

app.get(`/api/clima/:cep`, async(req, res) => {
  const fetchCep = await fetch(`https://cep.awesomeapi.com.br/json/${req.params.cep}`);
  const dadosCep = await fetchCep.json();

  const [latitude, longitude] = [dadosCep.lat, dadosCep.lng]

  const fetchClima = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation,relative_humidity_2m,apparent_temperature,rain,showers,surface_pressure,pressure_msl,cloud_cover`)
  const dadosClima = await fetchClima.json();

  console.log(dadosClima)

  const dados = {
    endereço: {
      cep: dadosCep.cep,
      endereço: dadosCep.address,
      cidade: `${dadosCep.city}, ${dadosCep.state}`,
      bairro: dadosCep.district
    },
    clima_atual: {
      status: codes[dadosClima.current.weather_code],
      temperatura: `${dadosClima.current.temperature_2m} ºC`,
      sensacao_termica: `${dadosClima.current.apparent_temperature} ºC`
    }
  }

  res.json(dados);
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});