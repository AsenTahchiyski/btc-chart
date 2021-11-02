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

// // Set up Kraken web socket
// async function startWebSocketConnection(onUpdate) {
//   const socket = new WebSocket('wss://ws.kraken.com');

//   socket.onmessage = msg => {
//     console.log('socket msg received');
//     const responseData = JSON.parse(msg.data);

//     if (responseData.event === 'heartbeat' ||
//       !Array.isArray(responseData[1])) {
//       return;
//     }

//     onUpdate(responseData[1]);
//   }

//   const subscribe = socket => {
//     const payload = {
//       event: "subscribe",
//       subscription: { name: "trade" },
//       pair: ["XBT/EUR"]
//     };

//     socket.send(JSON.stringify(payload));
//   }

//   var interval =
//     setInterval(() => {
//       if (socket.readyState) {
//         subscribe(socket);
//         clearInterval(interval);
//       }
//     }, 500);

//   window.onbeforeunload = () => {
//     socket.close();
//   }
// }

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
  // await startWebSocketConnection(this.updateChart)
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

// document.addEventListener('visibilitychange', () => {
//   if (!this.socket) {
//     this.main();
//   }
// });