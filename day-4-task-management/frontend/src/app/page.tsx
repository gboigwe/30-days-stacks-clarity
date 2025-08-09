// Main application page - Task Ecosystem Dashboard
'use client';

import { WalletProvider } from '@/contexts/WalletContext';
import TaskEcosystemDashboard from '@/components/TaskEcosystemDashboard';

export default function HomePage() {
  return (
    <WalletProvider>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <TaskEcosystemDashboard />
      </main>
    </WalletProvider>
  );
}