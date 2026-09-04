const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Mock Global Dependency Graph Data
const dependencyGraph = {
  nodes: [
    { id: 'SUP-192', name: 'TSMC Taiwan Fab 18', category: 'Supplier', riskScore: 78, status: 'DEGRADED', region: 'Asia-Pacific' },
    { id: 'CMP-882', name: 'NVIDIA H100 GPU Die', category: 'Component', riskScore: 65, status: 'WARNING', region: 'Asia-Pacific' },
    { id: 'FAC-004', name: 'Oregon Assembly Plant', category: 'Facility', riskScore: 12, status: 'HEALTHY', region: 'North America' },
    { id: 'DC-US-EAST', name: 'AWS us-east-1 Cluster', category: 'DataCenter', riskScore: 5, status: 'HEALTHY', region: 'North America' }
  ],
  edges: [
    { source: 'SUP-192', target: 'CMP-882', relationship: 'SUPPLIES' },
    { source: 'CMP-882', target: 'FAC-004', relationship: 'MANUFACTURES' },
    { source: 'FAC-004', target: 'DC-US-EAST', relationship: 'HOSTS_SERVERS' }
  ]
};

const activeCrises = [
  {
    id: 'C-2026-00421',
    severity: 'HIGH',
    cause: 'Semiconductor Supply Chain Degradation (Geopolitical Tension)',
    affectedNodes: 14,
    revenueExposure: '$42.8M',
    escalationProbability: '71%',
    recommendedAction: 'Activate Alternative Supplier B + Reroute 22% Inventory'
  }
];

// API Endpoints
app.get('/api/v1/graph', (req, res) => {
  res.status(200).json(dependencyGraph);
});

app.get('/api/v1/crises', (req, res) => {
  res.status(200).json(activeCrises);
});

// Health check endpoint for Kubernetes probes & Load Balancers
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'cascadia-core', timestamp: new Date().toISOString() });
});

// Single-Page Dashboard Interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CASCADIA | Crisis Intelligence War Room</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { background-color: #090d16; color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .glow-red { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
      </style>
    </head>
    <body class="p-6">
      <header class="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse"></span>
            CASCADIA
          </h1>
          <p class="text-xs text-slate-500 font-mono mt-1">Autonomous Cross-Domain Crisis Intelligence & Supply-Chain War Room</p>
        </div>
        <div class="text-right font-mono text-xs text-slate-400">
          <p>SYSTEM STATUS: <span class="text-emerald-400">OPERATIONAL</span></p>
          <p>CONFIDENCE INDEX: <span class="text-sky-400">86.4%</span></p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-slate-900 border border-red-900/50 rounded-lg p-5 glow-red lg:col-span-1">
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-mono bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded">CRISIS #C-2026-00421</span>
            <span class="text-xs font-mono text-red-500 font-bold">SEVERITY: HIGH</span>
          </div>
          <h2 class="text-lg font-bold text-slate-200 mb-2">${activeCrises[0].cause}</h2>
          
          <div class="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
            <div class="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span class="text-slate-500 block">REVENUE EXPOSURE</span>
              <span class="text-slate-200 text-sm font-bold">${activeCrises[0].revenueExposure}</span>
            </div>
            <div class="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span class="text-slate-500 block">ESCALATION PROB.</span>
              <span class="text-amber-400 text-sm font-bold">${activeCrises[0].escalationProbability}</span>
            </div>
          </div>

          <div class="bg-slate-950 p-3 rounded border border-slate-800 mb-4">
            <span class="text-xs font-mono text-sky-400 block mb-1">RECOMMENDED RESPONSE</span>
            <p class="text-xs text-slate-300">${activeCrises[0].recommendedAction}</p>
          </div>

          <button onclick="alert('Autonomous directive dispatched to procurement cluster.')" class="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold rounded transition">
            EXECUTE APPROVED RESPONSE
          </button>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-lg p-5 lg:col-span-2">
          <h2 class="text-sm font-mono text-slate-400 uppercase tracking-wider mb-4">Global Dependency Nodes</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead class="border-b border-slate-800 text-slate-500">
                <tr>
                  <th class="pb-2">NODE ID</th>
                  <th class="pb-2">ENTITY</th>
                  <th class="pb-2">CATEGORY</th>
                  <th class="pb-2">REGION</th>
                  <th class="pb-2">RISK SCORE</th>
                  <th class="pb-2">STATUS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                ${dependencyGraph.nodes.map(node => `
                  <tr>
                    <td class="py-3 text-slate-400">${node.id}</td>
                    <td class="py-3 text-slate-200 font-bold">${node.name}</td>
                    <td class="py-3 text-slate-400">${node.category}</td>
                    <td class="py-3 text-slate-500">${node.region}</td>
                    <td class="py-3 font-bold ${node.riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'}">${node.riskScore}/100</td>
                    <td class="py-3">
                      <span class="px-2 py-0.5 rounded text-[10px] ${
                        node.status === 'DEGRADED' ? 'bg-red-950 text-red-400 border border-red-800' :
                        node.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }">
                        ${node.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`[CASCADIA CORE] Intelligence system running on port ${PORT}`);
});