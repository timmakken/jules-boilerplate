'use client';

import { useEffect, useState } from 'react';
// No longer using useRouter from next/navigation for redirecting to login, signIn() handles it.
import { useSession } from 'next-auth/react'; // Import useSession

// ... (Keep Plan interface)
interface Plan {
  id: string;
  name: string;
  price: number;
  currency_code: string;
}


export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true); // Renamed for clarity
  const [error, setError] = useState<string | null>(null);

  const { data: session, status: authStatus } = useSession(); // Get session data and status

  useEffect(() => {
    async function fetchPlans() {
      // ... (existing plan fetching logic - no changes needed here)
      setIsLoadingPlans(true);
      setError(null);
      try {
        const response = await fetch('/api/chargebee/plans');
        if (!response.ok) {
          throw new Error(`Failed to fetch plans: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Check if plans array exists and has items
        if (!data.plans || !Array.isArray(data.plans) || data.plans.length === 0) {
          console.warn('No plans returned from API:', data);
          setPlans([]);
          return;
        }
        
        // Filter out any null or invalid plans before mapping
        const validPlans = data.plans.filter((p: any) => p && p.id);
        
        const fetchedPlans = validPlans.map((p: any) => ({
          id: p.id,
          name: p.name || p.id.replace(/-/g, ' ').replace(/_/g, ' '),
          price: p.price || 0,
          currency_code: p.currency_code || 'USD',
        }));
        setPlans(fetchedPlans);
      } catch (err) {
        // @ts-ignore
        setError(err.message);
        // @ts-ignore
        console.error("Error fetching plans:", err);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (authStatus !== 'authenticated' || !session?.user) {
      setError("Please login to subscribe.");
      // Optionally, could call signIn() here to prompt login
      // signIn();
      return;
    }

    // Use setIsLoadingPlans or a new state for checkout loading
    setIsLoadingPlans(true); // Or a new state like setIsLoadingCheckout(true)
    setError(null);

    try {
      const body = {
        planId,
        // Pass user details from the session.
        // Ensure your session callback in NextAuth options populates these.
        // @ts-ignore // session.user.id might not be on default User type from next-auth
        userId: session.user.id,
        userEmail: session.user.email,
      };

      const response = await fetch('/api/chargebee/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create checkout session: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Checkout URL not found in response.');
      }
    } catch (err) {
      // @ts-ignore
      setError(err.message);
      // @ts-ignore
      console.error("Error creating checkout session:", err.message);
    } finally {
      setIsLoadingPlans(false); // Or setIsLoadingCheckout(false)
    }
  };

  if (isLoadingPlans || authStatus === 'loading') { // Check auth status loading too
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  // ... (Keep existing error display logic)
  if (error && !isLoadingPlans) { // Only show general error if not actively loading plans (which has its own indicator)
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
        <p className="text-xl text-red-500">Error: {error}</p>
        {/* Avoid showing "Could not load pricing plans" if plans are actually loaded but another error occurred */}
        {plans.length === 0 && <p className="text-gray-400">Could not load pricing plans. Please try again later.</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-blue-400 mb-8">Our Pricing Plans</h1>
        <p className="text-xl text-gray-300 mb-10">
          Choose the perfect plan for your video creation needs.
        </p>
        {/* Display error related to subscription actions, if any, and not plan loading */}
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        {plans.length === 0 && !isLoadingPlans ? (
          <div className="mt-10 p-6 bg-gray-800 rounded-lg shadow-xl">
            <p className="text-lg text-gray-400">No pricing plans available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-blue-300 mb-3">{plan.name}</h2>
                  <p className="text-3xl font-bold mb-2">
                    {(plan.price / 100).toLocaleString(undefined, { style: 'currency', currency: plan.currency_code })}
                  </p>
                </div>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={authStatus !== 'authenticated' || isLoadingPlans}
                  className={`mt-6 font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out w-full ${
                    authStatus !== 'authenticated' || isLoadingPlans
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {authStatus === 'authenticated' ? 'Subscribe' : 'Login to Subscribe'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
