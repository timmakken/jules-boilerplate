export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-blue-400 mb-8 text-center">Terms of Service</h1>
        <div className="p-6 bg-gray-800 rounded-lg shadow-xl space-y-4 text-gray-300">
          <p>Welcome to videogen.ai. By accessing or using our service, you agree to be bound by these terms.</p>
          <h2 className="text-2xl font-semibold text-blue-300 pt-4">1. Service Usage</h2>
          <p>Details about acceptable use, user responsibilities, etc., will be outlined here.</p>
          <h2 className="text-2xl font-semibold text-blue-300 pt-4">2. Accounts</h2>
          <p>Information regarding account creation, security, and termination will be here.</p>
          <h2 className="text-2xl font-semibold text-blue-300 pt-4">3. Content Ownership</h2>
          <p>Clarifications on who owns the content generated and uploaded.</p>
          <p className="mt-6 text-gray-400">
            This is a placeholder. The full Terms of Service document will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
