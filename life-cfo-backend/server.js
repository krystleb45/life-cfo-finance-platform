const express = require('express');
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug: Log environment variables
console.log('🔍 Environment Check:');
console.log('PLAID_ENV:', process.env.PLAID_ENV);
console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID ? 'SET ✅' : 'MISSING ❌');
console.log('PLAID_SECRET:', process.env.PLAID_SECRET ? 'SET ✅' : 'MISSING ❌');

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

// Store access tokens (in production, use a database)
const accessTokens = new Map();

// Add debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    status: 'Backend is running',
    plaid_env: process.env.PLAID_ENV,
    client_id_set: !!process.env.PLAID_CLIENT_ID,
    secret_set: !!process.env.PLAID_SECRET,
    client_id_preview: process.env.PLAID_CLIENT_ID ? 
      process.env.PLAID_CLIENT_ID.substring(0, 8) + '...' : 'NOT SET',
    base_path: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox']
  });
});

// Create link token
app.post('/create-link-token', async (req, res) => {
  console.log('📡 Received request for link token');
  
  const request = {
    user: { client_user_id: 'user-id-123' },
    client_name: 'Life CFO',
    products: ['transactions', 'auth', 'assets'],
    country_codes: ['US'],
    language: 'en',
  };

  console.log('🔄 Sending request to Plaid:', JSON.stringify(request, null, 2));

  try {
    const response = await client.linkTokenCreate(request);
    console.log('✅ Plaid responded successfully');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Link token creation error:');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    res.status(500).json({ 
      error: error.message,
      plaidError: error.response?.data,
      status: error.response?.status
    });
  }
});

// Exchange public token for access token
app.post('/exchange-public-token', async (req, res) => {
  const { public_token } = req.body;
  console.log('🔄 Exchanging public token...');

  try {
    const response = await client.itemPublicTokenExchange({
      public_token: public_token,
    });

    const access_token = response.data.access_token;
    const item_id = response.data.item_id;
    
    // Store access token (in production, associate with user ID)
    accessTokens.set('user-id-123', access_token);
    
    console.log('✅ Token exchange successful');
    res.json({ access_token, item_id });
  } catch (error) {
    console.error('❌ Public token exchange error:', error);
    res.status(500).json({ 
      error: error.message,
      plaidError: error.response?.data 
    });
  }
});

// Get accounts
app.get('/accounts', async (req, res) => {
  const access_token = accessTokens.get('user-id-123');
  
  if (!access_token) {
    return res.status(400).json({ error: 'No access token found' });
  }

  try {
    const response = await client.accountsGet({
      access_token: access_token,
    });
    res.json(response.data);
  } catch (error) {
    console.error('❌ Accounts fetch error:', error);
    res.status(500).json({ 
      error: error.message,
      plaidError: error.response?.data 
    });
  }
});

// Get transactions
app.get('/transactions', async (req, res) => {
  const access_token = accessTokens.get('user-id-123');
  
  if (!access_token) {
    return res.status(400).json({ error: 'No access token found' });
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    const response = await client.transactionsGet({
      access_token: access_token,
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });
    res.json(response.data);
  } catch (error) {
    console.error('❌ Transactions fetch error:', error);
    res.status(500).json({ 
      error: error.message,
      plaidError: error.response?.data 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Life CFO Backend running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`🔍 Debug endpoint: http://localhost:${PORT}/debug`);
});