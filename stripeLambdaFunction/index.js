const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body); // Parse email from request body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: 'price_1QBKbpG8jnQLC5SAmZ0CFHhO', // Montly
          quantity: 1,
        },
        {
          price: 'price_1QBKcfG8jnQLC5SAUKU11z0u', // 1/2 Year
          quantity: 1,
        },
        {
          price: 'price_1QBKeDG8jnQLC5SA2gOWRfA2', // 1 Year
          quantity: 1,
        },
      ],
      mode: 'subscription', // This specifies that it's a subscription
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
