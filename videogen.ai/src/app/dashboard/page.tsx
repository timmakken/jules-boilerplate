export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-blue-400 mb-8">User Dashboard</h1>
        <p className="text-xl text-gray-300 mb-6">
          Welcome back! Here you'll find your projects, video generation history, and more.
        </p>
        {/* Placeholder for dashboard content */}
        <div className="mt-10 p-6 bg-gray-800 rounded-lg shadow-xl">
          <p className="text-lg text-gray-400">Dashboard content (like project list, recent videos) will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
