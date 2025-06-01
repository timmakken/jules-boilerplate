// Import Chargebee v3 using ES modules
import Chargebee from 'chargebee';

// Create and export a function to get a configured Chargebee instance
export function getChargebee() {
  // Log Chargebee configuration for debugging
  console.log('Initializing Chargebee with site:', process.env.CHARGEBEE_SITE);
  console.log('API Key present:', !!process.env.CHARGEBEE_API_KEY);
  
  // In v3, configuration is passed during instantiation
  // Use type assertion to bypass TypeScript's property checking
  const chargebee = new Chargebee({
    site: process.env.CHARGEBEE_SITE!,
    apiKey: process.env.CHARGEBEE_API_KEY!,
    // Set product catalog version to 2.0 as per the error message
    product_catalog_version: 'v2',
  } as any);
  
  console.log('Chargebee initialized with product catalog version v2');
  
  return chargebee;
}
