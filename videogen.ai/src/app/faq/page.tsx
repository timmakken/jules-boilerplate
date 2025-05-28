export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-blue-400 mb-8 text-center">Frequently Asked Questions</h1>
        {/* Placeholder for FAQ content */}
        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <h2 className="text-xl font-semibold text-blue-300 mb-2">Question {item}: Placeholder question?</h2>
              <p className="text-gray-400">
                Placeholder answer for question {item}. More details will be provided here soon.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
