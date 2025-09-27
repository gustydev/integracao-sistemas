require('dotenv').config();
const codes = require('./data/weatherCodes')
const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor Express funcionando!');
});

app.get(`/api/clima/hoje/:cep`, async(req, res) => {
  try {
    const fetchCep = await fetch(`https://cep.awesomeapi.com.br/json/${req.params.cep}`);
    const dadosCep = await fetchCep.json();

    if ([404, 400].includes(fetchCep.status)) {
      return res.json({erro: 'CEP não encontrado ou inválido.', status: fetchCep.status})
    }

    const [latitude, longitude] = [dadosCep.lat, dadosCep.lng]

    const fetchClima = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation,relative_humidity_2m,apparent_temperature,rain,showers,surface_pressure,pressure_msl,cloud_cover`)
    const dadosClima = await fetchClima.json();

    const dados = {
      endereço: {
        cep: dadosCep.cep,
        endereço: dadosCep.address,
        cidade: `${dadosCep.city}, ${dadosCep.state}`,
        bairro: dadosCep.district,
      },
      clima_atual: {
        status: codes[dadosClima.current.weather_code],
        temperatura: `${dadosClima.current.temperature_2m} ºC`,
        sensacao_termica: `${dadosClima.current.apparent_temperature} ºC`,
        umidade: `${dadosClima.current.relative_humidity_2m}%`,
        precipitacao: `${dadosClima.current.precipitation} mm`,
        cobertura_nuvens: `${dadosClima.current.cloud_cover}%`,
        pressao_do_ar: `${dadosClima.current.surface_pressure} hPa`,
      },
    };

    res.json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({erro: 'Erro interno no servidor.', status: 500})
  }
})

app.get(`/api/clima/previsao/:cep`, async (req, res) => {
  try {
    const fetchCep = await fetch(`https://cep.awesomeapi.com.br/json/${req.params.cep}`);
    const dadosCep = await fetchCep.json();

    if ([404, 400].includes(fetchCep.status)) {
      return res.json({erro: 'CEP não encontrado ou inválido.', status: fetchCep.status})
    }

    const [latitude, longitude] = [dadosCep.lat, dadosCep.lng];

    const fetchPrevisao = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5`);
    const dadosPrevisao = await fetchPrevisao.json();

    const previsaoFormatada = dadosPrevisao.daily.time.map((data, index) => {
      return {
        data: data,
        status: codes[dadosPrevisao.daily.weather_code[index]],
        temperatura_maxima: `${dadosPrevisao.daily.temperature_2m_max[index]} ºC`,
        temperatura_minima: `${dadosPrevisao.daily.temperature_2m_min[index]} ºC`,
      };
    });

    const resposta = {
      endereço: {
        cep: dadosCep.cep,
        endereço: dadosCep.address,
        cidade: `${dadosCep.city}, ${dadosCep.state}`,
        bairro: dadosCep.district,
      },
      previsao_5_dias: previsaoFormatada,
    };

    res.json(resposta);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});
  
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;