'use client';

import Link from 'next/link';

// Mock data for recent videos (assuming this is already defined from previous step)
const mockRecentVideos = [
  { id: '1', title: 'My First AI Masterpiece', thumbnailUrl: 'https://via.placeholder.com/150/1e40af/ffffff?Text=Video1', dateGenerated: '2024-03-10', duration: '0:45' },
  { id: '2', title: 'Exploring Neon Cityscapes', thumbnailUrl: 'https://via.placeholder.com/150/7c3aed/ffffff?Text=Video2', dateGenerated: '2024-03-09', duration: '1:12' },
  // ... more videos added for completeness if needed, or keep as is from previous step
];

// Mock data for Usage Statistics (assuming this is already defined)
const mockUsageStats = {
  videosGeneratedThisMonth: 12,
  creditsRemaining: 88,
  storageUsedMb: 750,
  storageTotalMb: 5000,
};

// Mock data for Account Summary
const mockAccountSummary = {
  userName: 'AI Enthusiast', 
  currentPlan: 'Pro Plan',
  memberSince: '2023-01-15',
};

export default function DashboardPage() {
  const storagePercentage = mockUsageStats.storageTotalMb > 0 ? (mockUsageStats.storageUsedMb / mockUsageStats.storageTotalMb) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Updated Header with User Name */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-blue-400">Your Dashboard</h1>
          <p className="mt-2 text-lg text-gray-300">
            Welcome back, <span className="font-semibold text-blue-300">{mockAccountSummary.userName}</span>! Here's an overview of your activity.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main column (Quick Actions, Recent Videos - already implemented) */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <section id="quick-actions" className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <h2 className="text-2xl font-semibold text-blue-300 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/generate" className="block text-center p-6 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors duration-150"><h3 className="text-xl font-semibold text-white mb-2">Generate New Video</h3><p className="text-blue-200 text-sm">Start creating with AI.</p></Link>
                <Link href="/projects" className="block text-center p-6 bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors duration-150"><h3 className="text-xl font-semibold text-white mb-2">View My Projects</h3><p className="text-indigo-200 text-sm">See your video library.</p></Link>
                <Link href="/pricing" className="block text-center p-6 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition-colors duration-150"><h3 className="text-xl font-semibold text-white mb-2">Upgrade Account</h3><p className="text-purple-200 text-sm">Unlock more features.</p></Link>
              </div>
            </section>
            <section id="recent-videos" className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-semibold text-blue-300">Recent Videos</h2><Link href="/projects" className="text-sm text-blue-400 hover:text-blue-300">View All</Link></div>
              {mockRecentVideos.length > 0 ? (<div className="space-y-4">{mockRecentVideos.slice(0, 3).map((video) => (<div key={video.id} className="flex items-center p-4 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition-colors duration-150"><img src={video.thumbnailUrl} alt={`Thumbnail for ${video.title}`} className="w-24 h-16 object-cover rounded-md mr-4 bg-gray-600"/><div className="flex-grow"><h3 className="text-lg font-medium text-white">{video.title}</h3><p className="text-sm text-gray-400">Generated: {video.dateGenerated}</p></div><div className="text-right"><p className="text-sm text-gray-300">{video.duration}</p><Link href={`/projects/${video.id}`} className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">Details</Link></div></div>))}</div>) : (<p className="text-gray-400">You haven't generated any videos yet. <Link href="/generate" className="text-blue-400 hover:text-blue-300">Start creating!</Link></p>)}
            </section>
          </div>

          {/* Sidebar column */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            {/* Updated Account Summary Section */}
            <section id="account-summary" className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Account Summary</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400 block">User Name:</span>
                  <span className="text-lg text-white font-medium">{mockAccountSummary.userName}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-400 block">Current Plan:</span>
                  <span className="text-lg text-white font-medium">{mockAccountSummary.currentPlan}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-400 block">Member Since:</span>
                  <span className="text-lg text-white font-medium">{mockAccountSummary.memberSince}</span>
                </div>
                <div className="pt-2">
                  <Link href="/account" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                    Manage Account
                  </Link>
                </div>
              </div>
            </section>

            {/* Usage Statistics (already implemented) */}
            <section id="usage-stats" className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Usage Statistics</h2>
              <div className="space-y-3">
                <div><div className="flex justify-between text-sm text-gray-300"><span>Videos This Month:</span><span className="font-medium text-white">{mockUsageStats.videosGeneratedThisMonth}</span></div></div>
                <div><div className="flex justify-between text-sm text-gray-300"><span>Credits Remaining:</span><span className="font-medium text-white">{mockUsageStats.creditsRemaining}</span></div></div>
                <div><div className="flex justify-between text-sm text-gray-300 mb-1"><span>Storage Used:</span><span className="font-medium text-white">{mockUsageStats.storageUsedMb} MB / {mockUsageStats.storageTotalMb} MB</span></div><div className="w-full bg-gray-700 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${storagePercentage}%` }}></div></div></div>
                <div className="pt-2"><Link href="/usage-details" className="text-sm text-blue-400 hover:text-blue-300">View Detailed Usage</Link></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
