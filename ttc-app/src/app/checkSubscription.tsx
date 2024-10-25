const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkSubscriptionStatus(email: string) {
  try {
    // Retrieve all customers matching the email
    const customers = await stripe.customers.list({ email });
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;

      // Retrieve all subscriptions for the customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',  // You can filter for 'active' or 'past_due' if needed
      });

      // Check if any active subscription exists
      const activeSubscription = subscriptions.data.find((sub: { status: string; }) => sub.status === 'active');

      return !!activeSubscription;
    }

    return false;  // No customer or no active subscription found
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}
