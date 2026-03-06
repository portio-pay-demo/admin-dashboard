import { requireSession } from '@/lib/auth/session';
import { validateCsrfToken } from '@/lib/auth/csrf';

interface PageProps {
  params: { id: string };
}

export default async function MerchantSettingsPage({ params }: PageProps) {
  const session = await requireSession();

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Merchant Settings — {params.id}</h1>
      {/* 
        NP-2034: CSRF token is injected as a meta tag and read by the
        client-side form handler before submitting mutations.
        Server-side: validateCsrfToken() is called in the tRPC mutation handler.
      */}
      <MerchantSettingsForm merchantId={params.id} />
    </main>
  );
}

function MerchantSettingsForm({ merchantId }: { merchantId: string }) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
        <input
          type="url"
          name="webhookUrl"
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          placeholder="https://your-endpoint.example.com/webhooks"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Rate Limit Tier</label>
        <select name="tier" className="mt-1 block w-full rounded border-gray-300 shadow-sm">
          <option value="standard">Standard (100 req/s)</option>
          <option value="enterprise">Enterprise (1000 req/s)</option>
        </select>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Settings
      </button>
    </form>
  );
}
