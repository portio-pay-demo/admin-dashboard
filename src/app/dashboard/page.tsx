import { requireSession } from '@/lib/auth/session';
import { getMerchantMetrics } from '@/lib/metrics-cache';

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">PortIOPay Operations Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Transactions (24h)" value="1,842,340" delta="+3.2%" />
        <MetricCard title="Success Rate" value="99.7%" delta="+0.1%" />
        <MetricCard title="P95 Latency" value="142ms" delta="-8ms" />
      </div>
    </main>
  );
}

function MetricCard({ title, value, delta }: { title: string; value: string; delta: string }) {
  const positive = delta.startsWith('+');
  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className={`text-sm mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>{delta} vs yesterday</p>
    </div>
  );
}
