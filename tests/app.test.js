const request = require('supertest');
const app = require('../src/app');

describe('GET /api/clima/hoje/:cep', () => {
  test('Deve retornar os dados de endereço e clima atual para um CEP válido', async () => {
    const response = await request(app).get('/api/clima/hoje/60170001');

    expect(response.status).toBe(200);
    expect(response.body.endereço.cidade).toBe('Fortaleza, CE');
    expect(response.body.endereço.bairro).toBe('Aldeota');
    expect(response.body).toHaveProperty('clima_atual');
  });

  test('Deve retornar erro 404 para um CEP inválido', async () => {
    const response = await request(app).get('/api/clima/hoje/00000000');

    expect(response.body.status).toBe(404);
    expect(response.body.erro).toBe('CEP não encontrado ou inválido.');
  });
});

describe('GET /api/clima/previsao/:cep', () => {
  test('Deve retornar a previsão de 5 dias para um CEP válido', async () => {
    const response = await request(app).get('/api/clima/previsao/60170001');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('previsao_5_dias');
    expect(response.body.previsao_5_dias).toHaveLength(5);
  });

  test('Deve retornar erro quando a API de CEP falhar', async () => {
    const response = await request(app).get('/api/clima/previsao/00000000');

    expect(response.body.status).toBe(404);
    expect(response.body.erro).toBe('CEP não encontrado ou inválido.');
  });
});