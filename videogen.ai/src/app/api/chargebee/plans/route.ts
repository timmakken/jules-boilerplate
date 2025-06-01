import { NextRequest, NextResponse } from 'next/server';
import { getChargebee } from '@/lib/chargebee';

export async function GET(request: NextRequest) {
  try {
    const chargebee = getChargebee();
    
    // Use the correct parameter structure for Chargebee v3 with product catalog version 2.0
    const params = {
      limit: 100, // Fetch more plans to ensure we get all
      "status[is]": "active", // Fetch only active plans
      "item_type[is]": "plan", // Ensure we are fetching plans
    } as any;

    console.log('Fetching plans with params:', params);
    
    // Try to log available methods on chargebee to debug
    console.log('Available methods on chargebee:', Object.keys(chargebee));
    
    // Try using camelCase method name (itemPrice) instead of snake_case (item_price)
    try {
      // @ts-ignore - Ignore TypeScript errors for now as we're adapting to Chargebee v3
      const result = await chargebee.itemPrice.list(params);
      
      console.log('Chargebee plans response received');
      
      // Check if result.list exists and is an array
      if (!result.list || !Array.isArray(result.list)) {
        console.error('Invalid response structure:', result);
        return NextResponse.json({ error: 'Invalid response from Chargebee' }, { status: 500 });
      }
      
      console.log(`Found ${result.list.length} plans`);
      
      // Safely map over the list, checking each entry
      const plans = result.list.map((entry: any) => {
        if (!entry || (!entry.item_price && !entry.itemPrice)) {
          console.error('Invalid entry in list:', entry);
          return null;
        }
        
        // Support both snake_case and camelCase property names
        const itemPrice = entry.item_price || entry.itemPrice;
        
        // Log the item price for debugging
        console.log('Processing item price:', {
          id: itemPrice.id,
          name: itemPrice.name || itemPrice.item?.name,
          price: itemPrice.price,
          currency_code: itemPrice.currency_code
        });
        
        return {
          id: itemPrice.id,
          name: itemPrice.name || itemPrice.item?.name || itemPrice.id,
          price: itemPrice.price || 0,
          currency_code: itemPrice.currency_code || 'USD',
        };
      }).filter(Boolean); // Remove any null entries

      return NextResponse.json({ plans });
    } catch (itemPriceError) {
      console.error('Error using itemPrice.list:', itemPriceError);
      
      // Try alternative method names
      console.log('Trying alternative method: item_prices.list');
      try {
        // @ts-ignore
        const result = await chargebee.item_prices.list(params);
        
        // Process result as above
        if (!result.list || !Array.isArray(result.list)) {
          throw new Error('Invalid response structure');
        }
        
        const plans = result.list.map((entry: any) => {
          const itemPrice = entry.item_price || entry.itemPrice;
          if (!itemPrice) return null;
          
          return {
            id: itemPrice.id,
            name: itemPrice.name || itemPrice.item?.name || itemPrice.id,
            price: itemPrice.price || 0,
            currency_code: itemPrice.currency_code || 'USD',
          };
        }).filter(Boolean);
        
        return NextResponse.json({ plans });
      } catch (itemPricesError) {
        console.error('Error using item_prices.list:', itemPricesError);
        
        // Try one more alternative
        console.log('Trying alternative method: plan.list');
        try {
          // @ts-ignore
          const result = await chargebee.plan.list(params);
          
          if (!result.list || !Array.isArray(result.list)) {
            throw new Error('Invalid response structure');
          }
          
          const plans = result.list.map((entry: any) => {
            const plan = entry.plan;
            if (!plan) return null;
            
            return {
              id: plan.id,
              name: plan.name || plan.id,
              price: plan.price || 0,
              currency_code: plan.currency_code || 'USD',
            };
          }).filter(Boolean);
          
          return NextResponse.json({ plans });
        } catch (planError) {
          console.error('Error using plan.list:', planError);
          throw new Error('All methods failed to fetch plans');
        }
      }
    }
  } catch (error) {
    console.error('Error fetching plans from Chargebee:', error);
    // @ts-ignore
    const errorMessage = error.message || 'Failed to fetch plans';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
