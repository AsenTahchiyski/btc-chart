// Transform Kraken to D3 data format
function transformDataKraken(item) {
  return {
    x: item[2] * 1000,
    y: parseFloat(item[0])
  }
}

// Transform Binance to D3 data format
function transformDataBinance(item) {
  return {
    x: item.time,
    y: parseFloat(item.price)
  }
}

// Fetch price history
async function getInitialData() {
  const response = await fetch('https://api.binance.com/api/v3/trades?symbol=BTCEUR')
  return await response.json();
}

// Update chart with new data
function updateChart(data) {
  const updateDataSet = [];
  for (const item of data) {
    updateDataSet.push(this.transformDataKraken(item));
  }

  this.chartData = [...this.chartData.splice(updateDataSet.length), ...updateDataSet];
  chart.update(this.chartData);
}

async function main() {
  const chartDataRaw = await getInitialData();
  this.chartData = chartDataRaw.map(item => this.transformDataBinance(item));

  chart.create(this.chartData);

  if (typeof(worker) === 'undefined') {
    worker = new Worker('WebSocketWebWorker.js');
  }

  worker.onmessage = event => {
    this.updateChart(event.data);
  }
}

window.onbeforeunload = () => {
  worker.postMessage({ status: 'closing'});
}

const chart = new LineChart();
let chartData = [];
main();
