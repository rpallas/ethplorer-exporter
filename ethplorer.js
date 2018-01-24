'use strict';

const server = require('express')();
const { register, Gauge, collectDefaultMetrics } = require('prom-client');

const got = require('got');
let response;

(async () => {
  try {
    response = await got('https://api.ethplorer.io/getAddressInfo/0xCa5b4dDA6CF6Ef6b76F289a3aD228b31B327e05d?apiKey=freekey', { json: true });
    ethMetrics(response);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

function ethMetrics(response) {
  const { address, ETH, countTxs, tokens } = response.body;
  const prefix = 'ethplorer_account_';
  
  const balanceGauge = new Gauge({ name: `${prefix}eth_balance`, help: 'Total balance of either in account', labelNames: ['address'] });
  balanceGauge.set({ address: address }, ETH.balance);
  const totalInGauge = new Gauge({ name: `${prefix}eth_totalIn`, help: 'Total either transferred into account', labelNames: ['address'] });
  totalInGauge.set({ address: address }, ETH.totalIn);
  const totalOutGauge = new Gauge({ name: `${prefix}eth_totalOut`, help: 'Total either transferred out of account', labelNames: ['address'] });
  totalOutGauge.set({ address: address }, ETH.totalOut);
  
  console.log(`balanceGauge: ${JSON.stringify(balanceGauge.get())},  totalInGauge: ${JSON.stringify(totalInGauge.get())},  totalOutGauge: ${JSON.stringify(totalOutGauge.get())},`);
}

server.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

// Enable collection of default metrics
collectDefaultMetrics();
// console.log(collectDefaultMetrics.metricsList);

console.log('Server listening to 3000, metrics exposed on /metrics endpoint');
server.listen(3000);
