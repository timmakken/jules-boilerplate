'use client'; // This component will make client-side requests

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import for App Router

interface Plan {
  id: string;
  name: string;
  price: number; // Assuming price is in cents
  currency_code: string;
  // Add other plan properties you want to display, e.g., description, features
  // For example:
  // description?: string;
  // period?: number;
  // period_unit?: string;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [mockUser, setMockUser] = useState<any>(null);

  useEffect(() => {
    // Check for mock user in localStorage
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setMockUser(JSON.parse(storedUser));
    }

    async function fetchPlans() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/chargebee/plans');
        if (!response.ok) {
          throw new Error(`Failed to fetch plans: ${response.statusText}`);
        }
        const data = await response.json();
        // Assuming the API returns { plans: [...] }
        // And each plan has at least id, name, price, currency_code
        // You might need to adjust the mapping based on the actual API response structure
        const fetchedPlans = data.plans.map((p: any) => ({
          id: p.id,
          name: p.name || p.id.replace(/-/g, ' ').replace(/_/g, ' '), // Basic name formatting if not present
          price: p.price, // Ensure this is the correct property for price
          currency_code: p.currency_code,
          // description: p.description,
          // period: p.period,
          // period_unit: p.period_unit,
        }));
        setPlans(fetchedPlans);
      } catch (err) {
        // @ts-ignore
        setError(err.message);
        console.error("Error fetching plans:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!mockUser) {
      setError("Please login to subscribe."); // Or redirect to a login page
      return;
    }
    setIsLoading(true); // To disable button during this async operation
    setError(null);

    try {
      const body = {
        planId,
        userId: mockUser.id, // Pass mock user ID
        userEmail: mockUser.email, // Pass mock user email
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
        // Redirect to Chargebee's hosted checkout page
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Checkout URL not found in response.');
      }
    } catch (err) {
      // @ts-ignore
      setError(err.message);
      // @ts-ignore
      console.error("Error creating checkout session:", err.message);
      // You might want to show a user-friendly error message here
    } finally {
      setIsLoading(false); // Re-enable button
    }
  };

  if (isLoading && plans.length === 0) { // Keep loading indicator if plans are not yet fetched
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-xl">Loading pricing plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
        <p className="text-xl text-red-500">Error: {error}</p>
        <p className="text-gray-400">Could not load pricing plans. Please try again later.</p>
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

        {plans.length === 0 ? (
          <div className="mt-10 p-6 bg-gray-800 rounded-lg shadow-xl">
            <p className="text-lg text-gray-400">No pricing plans available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-blue-300 mb-3">{plan.name}</h2>
                  {/* Display price - ensure formatting is correct (e.g., cents to dollars) */}
                  <p className="text-3xl font-bold mb-2">
                    {/* This assumes price is in cents. Adjust if necessary. */}
                    {(plan.price / 100).toLocaleString(undefined, { style: 'currency', currency: plan.currency_code })}
                  </p>
                  {/* Add more plan details here if available, e.g., plan.description */}
                  {/* <p className="text-gray-400 mb-4">{plan.description || 'Basic features included.'}</p> */}
                  {/* <p className="text-gray-400 text-sm mb-4">Billed per {plan.period} {plan.period_unit}(s)</p> */}
                </div>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!mockUser || isLoading} // Disable if not logged in or if another operation is loading
                  className={`mt-6 font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out w-full ${
                    !mockUser || isLoading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {mockUser ? 'Subscribe' : 'Login to Subscribe'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
