import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Calendar, Target, AlertCircle, CheckCircle, Edit3, Save, X, Settings, Link, Unlink } from 'lucide-react';
import { usePlaidLink } from 'react-plaid-link';

// Real Plaid Link component with backend integration
const PlaidLinkComponent = ({ onSuccess, children }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get link token from your backend
    const fetchLinkToken = async () => {
      try {
        const response = await fetch('http://localhost:3001/create-link-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error fetching link token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      console.log('Plaid Link success:', { public_token, metadata });
      
      try {
        // Exchange public token for access token
        const response = await fetch('http://localhost:3001/exchange-public-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token }),
        });
        
        const data = await response.json();
        console.log('Token exchange successful:', data);
        
        onSuccess(public_token, metadata);
      } catch (error) {
        console.error('Error exchanging token:', error);
      }
    },
    onExit: (err, metadata) => {
      console.log('Plaid Link exit:', { err, metadata });
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event:', { eventName, metadata });
    },
  });

  if (loading) {
    return <div style={{ padding: '0.5rem', color: '#6b7280' }}>Loading Plaid...</div>;
  }

  return (
    <div onClick={() => ready ? open() : null} style={{ cursor: ready ? 'pointer' : 'not-allowed' }}>
      {children}
    </div>
  );
};

const LifeCFO = () => {
  // Load saved data or use defaults
  const loadData = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`lifeCFO_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  const saveData = (key, data) => {
    try {
      localStorage.setItem(`lifeCFO_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  // Your real financial data with persistence
  const [incomeStreams, setIncomeStreams] = useState(() => 
    loadData('incomeStreams', [
      { name: 'Salary', amount: 14302.76, frequency: 'monthly', date: '10th & 26th' },
      { name: 'VA Disability', amount: 2820.96, frequency: 'monthly', date: '1st' }
    ])
  );

  const [expenses, setExpenses] = useState(() =>
    loadData('expenses', [
      { category: 'Tithe', amount: 700, priority: 1 },
      { category: 'Mortgage/Rent', amount: 4817.68, priority: 1 },
      { category: 'Suburban Payment', amount: 1365.59, priority: 1 },
      { category: 'Tesla Payment', amount: 1199.96, priority: 1 },
      { category: 'Cell Phone', amount: 312.26, priority: 1 },
      { category: 'Internet', amount: 110, priority: 1 },
      { category: 'Utilities', amount: 350, priority: 1 },
      { category: 'Groceries', amount: 600, priority: 1 },
      { category: 'Transportation', amount: 60, priority: 1 },
      { category: 'Krystle Turnbull', amount: 1200, priority: 1 },
      { category: 'Ondra Turnbull', amount: 221, priority: 1 },
      { category: 'Student Loans', amount: 408, priority: 1 },
      { category: 'Car Insurance', amount: 330, priority: 1 },
      { category: 'Solar', amount: 662.19, priority: 1 },
      { category: 'RV Payment', amount: 274, priority: 1 }
    ])
  );

  const [investments, setInvestments] = useState(() =>
    loadData('investments', [
      { name: 'Monthly Investment', amount: 500 }
    ])
  );

  // Debt data with persistence
  const [debts, setDebts] = useState(() =>
    loadData('debts', [
      { 
        name: 'RV Loan', 
        balance: 18000,
        payment: 274, 
        interestRate: 6.5,
        minPayment: 274 
      },
      { 
        name: 'Suburban Loan', 
        balance: 35000,
        payment: 1365.59, 
        interestRate: 4.2,
        minPayment: 1365.59 
      },
      { 
        name: 'Tesla Loan', 
        balance: 42000,
        payment: 1199.96, 
        interestRate: 3.8,
        minPayment: 1199.96 
      },
      { 
        name: 'Student Loans', 
        balance: 25000,
        payment: 408, 
        interestRate: 5.5,
        minPayment: 408 
      }
    ])
  );

  // Plaid Integration State
  const [connectedAccounts, setConnectedAccounts] = useState(() =>
    loadData('connectedAccounts', [])
  );
  
  const [accountBalances, setAccountBalances] = useState(() =>
    loadData('accountBalances', {})
  );

  const [transactions, setTransactions] = useState(() =>
    loadData('transactions', [])
  );

  const [isConnecting, setIsConnecting] = useState(false);

  // Save data whenever state changes
  useEffect(() => {
    saveData('incomeStreams', incomeStreams);
  }, [incomeStreams]);

  useEffect(() => {
    saveData('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    saveData('investments', investments);
  }, [investments]);

  useEffect(() => {
    saveData('debts', debts);
  }, [debts]);

  useEffect(() => {
    saveData('connectedAccounts', connectedAccounts);
  }, [connectedAccounts]);

  useEffect(() => {
    saveData('accountBalances', accountBalances);
  }, [accountBalances]);

  useEffect(() => {
    saveData('transactions', transactions);
  }, [transactions]);

  // Edit states
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  const [editingInvestment, setEditingInvestment] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [extraPayment, setExtraPayment] = useState(1000);
  const [selectedDebt, setSelectedDebt] = useState(0);

  // Decision Simulator state
  const [scenario, setScenario] = useState({
    type: 'business_investment',
    name: 'Hire Developer',
    upfrontCost: 7000,
    monthlyIncome: 300,
    monthlyExpense: 0,
    duration: 6,
    startMonth: 1
  });

  // Plaid Integration Functions
  const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
    setIsConnecting(true);
    
    try {
      const newAccount = {
        id: Date.now().toString(),
        institutionName: metadata.institution.name,
        institutionId: metadata.institution?.institution_id || metadata.institution.id,
        accounts: metadata.accounts,
        connectedAt: new Date().toISOString(),
        publicToken: publicToken
      };

      setConnectedAccounts(prev => [...prev, newAccount]);
      
      // Fetch real account balances and transactions from backend
      try {
        const accountsResponse = await fetch('http://localhost:3001/accounts');
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          
          const balances = {};
          accountsData.accounts?.forEach(account => {
            balances[account.account_id] = {
              current: account.balances.current,
              available: account.balances.available,
              lastUpdated: new Date().toISOString()
            };
          });
          setAccountBalances(prev => ({ ...prev, ...balances }));

          // Fetch transactions
          const transactionsResponse = await fetch('http://localhost:3001/transactions');
          if (transactionsResponse.ok) {
            const transactionsData = await transactionsResponse.json();
            
            const formattedTransactions = transactionsData.transactions?.map(tx => ({
              id: tx.transaction_id,
              accountId: tx.account_id,
              amount: -tx.amount, // Plaid uses positive for outflows
              date: tx.date,
              name: tx.name,
              category: tx.category
            })) || [];
            
            setTransactions(prev => [...prev, ...formattedTransactions]);
          }
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        // Fall back to mock data if backend fails
        const mockBalances = {};
        metadata.accounts?.forEach(account => {
          mockBalances[account.id] = {
            current: account.subtype === 'checking' ? 8500 : 15000,
            available: account.subtype === 'checking' ? 8500 : 15000,
            lastUpdated: new Date().toISOString()
          };
        });
        setAccountBalances(prev => ({ ...prev, ...mockBalances }));
      }
      
    } catch (error) {
      console.error('Error connecting account:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectAccount = (accountId) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    setAccountBalances(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (key.startsWith(accountId)) {
          delete updated[key];
        }
      });
      return updated;
    });
    setTransactions(prev => prev.filter(tx => !tx.accountId?.startsWith(accountId)));
  };

  // Calculate totals
  const totalIncome = incomeStreams.reduce((sum, stream) => sum + stream.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const availableForSpending = totalIncome - totalExpenses - totalInvestments;

  // Calculate actual account balances
  const totalAccountBalance = Object.values(accountBalances).reduce((sum, balance) => sum + (balance.current || 0), 0);

  // Removed unused exitPlan object and emergency fund calculations
  // These are now handled within the Dashboard component where they're actually used

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Debt calculation functions
  const calculatePayoffTime = (balance, payment, interestRate) => {
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) return Math.ceil(balance / payment);
    
    const months = -Math.log(1 - (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
    return Math.ceil(months);
  };

  const calculateTotalInterest = (balance, payment, interestRate) => {
    const months = calculatePayoffTime(balance, payment, interestRate);
    return (payment * months) - balance;
  };

  const calculateDebtFreeDate = (debts, extraPayment = 0, strategy = 'avalanche') => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalPayment = debts.reduce((sum, debt) => sum + debt.payment, 0) + extraPayment;
    const avgRate = debts.reduce((sum, debt) => sum + (debt.interestRate * debt.balance), 0) / totalDebt;
    
    return calculatePayoffTime(totalDebt, totalPayment, avgRate);
  };

  // Decision Simulator calculations
  const simulateScenario = (baseIncome, baseExpenses, scenario) => {
    const results = [];
    let cumulativeCashFlow = 0;
    let emergencyFundImpact = 0;
    
    // Use a simple emergency fund baseline for scenario simulation
    const baseEmergencyFund = Math.max(5000, totalAccountBalance * 0.3);
    
    if (scenario.upfrontCost > 0) {
      cumulativeCashFlow -= scenario.upfrontCost;
      emergencyFundImpact -= scenario.upfrontCost;
    }
    
    for (let month = 1; month <= 24; month++) {
      let monthlyIncome = baseIncome;
      let monthlyExpenses = baseExpenses;
      
      if (month >= scenario.startMonth && month < scenario.startMonth + scenario.duration) {
        monthlyIncome += scenario.monthlyIncome;
        monthlyExpenses += scenario.monthlyExpense;
      }
      
      const monthlyNetCashFlow = monthlyIncome - monthlyExpenses;
      cumulativeCashFlow += monthlyNetCashFlow;
      
      results.push({
        month,
        monthlyIncome,
        monthlyExpenses,
        monthlyNetCashFlow,
        cumulativeCashFlow,
        emergencyFundLevel: Math.max(0, baseEmergencyFund + emergencyFundImpact + (cumulativeCashFlow - scenario.upfrontCost))
      });
    }
    
    return results;
  };

  const getScenarioInsights = (simulation, scenario) => {
    const breakEvenMonth = simulation.find(month => month.cumulativeCashFlow >= 0)?.month || 'Never';
    const month12CashFlow = simulation[11]?.cumulativeCashFlow || 0;
    const emergencyFundRisk = simulation.some(month => month.emergencyFundLevel < 1000);
    const totalROI = simulation[23]?.cumulativeCashFlow || 0;
    
    return {
      breakEvenMonth,
      month12CashFlow,
      emergencyFundRisk,
      totalROI,
      isViable: breakEvenMonth !== 'Never' && breakEvenMonth <= 18,
      riskLevel: emergencyFundRisk ? 'High' : month12CashFlow < 0 ? 'Medium' : 'Low'
    };
  };

  // Settings Page Component
  const SettingsPage = () => {
    return (
      <div>
        <div className="card">
          <h3 className="card-title">Bank Account Connections</h3>
          
          {connectedAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Connect your bank accounts to automatically sync balances and transactions
              </p>
              <PlaidLinkComponent onSuccess={onPlaidSuccess}>
                <button
                  disabled={isConnecting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isConnecting ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Link size={20} />
                  {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
                </button>
              </PlaidLinkComponent>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Connected accounts will automatically sync balances and transactions
              </p>
              {connectedAccounts.map((account) => (
                <div key={account.id} className="list-item">
                  <div>
                    <h4>{account.institutionName}</h4>
                    <p>{account.accounts?.length || 0} account(s) connected</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Connected {new Date(account.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => disconnectAccount(account.id)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Unlink size={16} />
                    Disconnect
                  </button>
                </div>
              ))}
              
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <PlaidLinkComponent onSuccess={onPlaidSuccess}>
                  <button
                    disabled={isConnecting}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: isConnecting ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: isConnecting ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Link size={16} />
                    {isConnecting ? 'Connecting...' : 'Connect Another Account'}
                  </button>
                </PlaidLinkComponent>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Data Management</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              onClick={() => {
                const data = {
                  incomeStreams,
                  expenses,
                  investments,
                  debts,
                  connectedAccounts: connectedAccounts.map(acc => ({ ...acc, publicToken: '[HIDDEN]' })),
                  exportDate: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `life-cfo-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              📥 Export Data
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('This will clear all your data. Are you sure?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              🗑️ Reset All Data
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Plaid Integration Status</h3>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Status:</strong> {connectedAccounts.length > 0 ? '✅ Connected' : '⏸️ Not Connected'}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Connected Accounts:</strong> {connectedAccounts.length}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Last Sync:</strong> {connectedAccounts.length > 0 ? 'Just now' : 'Never'}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Real Plaid integration ready. Connect to sandbox or production accounts.
            </div>
          </div>
        </div>
      </div>
    );
  };

// Enhanced Dashboard Component with Job Exit Settings and Debt Progress
const Dashboard = () => {
  // Job Exit Readiness Settings - should be stored in state
  const [jobExitSettings, setJobExitSettings] = useState(() => 
    loadData('jobExitSettings', {
      targetEmergencyFundMonths: 6,
      targetSideIncome: 8000,
      currentSideIncome: 0,
      targetAccountBalance: 50000,
      jobExitGoalDate: '',
      riskTolerance: 'medium' // low, medium, high
    })
  );

  const [showJobExitSettings, setShowJobExitSettings] = useState(false);

  // Save job exit settings when they change
  useEffect(() => {
    saveData('jobExitSettings', jobExitSettings);
  }, [jobExitSettings]);

  // Enhanced job exit calculations - use the main component's existing variables
  const jobExitEmergencyFundNeeded = totalExpenses * jobExitSettings.targetEmergencyFundMonths;
  const jobExitCurrentEmergencyFund = Math.max(5000, totalAccountBalance * 0.3);
  const jobExitEmergencyFundProgress = Math.min((jobExitCurrentEmergencyFund / jobExitEmergencyFundNeeded) * 100, 100);
  
  const sideIncomeProgress = Math.min((jobExitSettings.currentSideIncome / jobExitSettings.targetSideIncome) * 100, 100);
  const accountBalanceProgress = Math.min((totalAccountBalance / jobExitSettings.targetAccountBalance) * 100, 100);
  
  // Overall job exit readiness (weighted average)
  const overallReadiness = (jobExitEmergencyFundProgress * 0.4 + sideIncomeProgress * 0.35 + accountBalanceProgress * 0.25);
  
  const jobExitMonthsToFullEmergencyFund = availableForSpending > 0 
    ? Math.ceil((jobExitEmergencyFundNeeded - jobExitCurrentEmergencyFund) / availableForSpending)
    : Infinity;

  // Total debt calculations
  const totalDebtBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalDebtPayments = debts.reduce((sum, debt) => sum + debt.payment, 0);
  const averageDebtRate = totalDebtBalance > 0 
    ? debts.reduce((sum, debt) => sum + (debt.interestRate * debt.balance), 0) / totalDebtBalance
    : 0;
  
  // Calculate debt payoff time and progress
  const debtPayoffMonths = totalDebtBalance > 0 
    ? calculatePayoffTime(totalDebtBalance, totalDebtPayments, averageDebtRate)
    : 0;
  
  const totalInterestSaved = totalDebtBalance > 0 
    ? debts.reduce((sum, debt) => sum + calculateTotalInterest(debt.balance, debt.payment, debt.interestRate), 0)
    : 0;

  // Financial health score (0-100)
  const calculateHealthScore = () => {
    let score = 0;
    
    // Income vs Expenses (30 points)
    const expenseRatio = totalExpenses / totalIncome;
    if (expenseRatio < 0.5) score += 30;
    else if (expenseRatio < 0.7) score += 20;
    else if (expenseRatio < 0.9) score += 10;
    
    // Emergency Fund (25 points)
    if (jobExitEmergencyFundProgress >= 100) score += 25;
    else if (jobExitEmergencyFundProgress >= 75) score += 20;
    else if (jobExitEmergencyFundProgress >= 50) score += 15;
    else if (jobExitEmergencyFundProgress >= 25) score += 10;
    
    // Investment Rate (20 points)
    const investmentRate = totalInvestments / totalIncome;
    if (investmentRate >= 0.15) score += 20;
    else if (investmentRate >= 0.10) score += 15;
    else if (investmentRate >= 0.05) score += 10;
    
    // Debt to Income (25 points)
    const debtToIncome = totalDebtPayments / totalIncome;
    if (debtToIncome < 0.1) score += 25;
    else if (debtToIncome < 0.2) score += 20;
    else if (debtToIncome < 0.3) score += 15;
    else if (debtToIncome < 0.4) score += 10;
    
    return Math.round(score);
  };

  const healthScore = calculateHealthScore();

  return (
    <div>
      {/* Financial Health Score */}
      <div className="card">
        <h3 className="card-title">💪 Financial Health Score</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(healthScore / 100) * 314} 314`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444'
            }}>
              {healthScore}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
              {healthScore >= 80 ? '🔥 Excellent!' : healthScore >= 60 ? '👍 Good' : healthScore >= 40 ? '⚠️ Needs Work' : '🚨 Critical'}
            </p>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <div>
                <p style={{ margin: '0.25rem 0' }}>💰 Expense Ratio: {((totalExpenses / totalIncome) * 100).toFixed(1)}%</p>
                <p style={{ margin: '0.25rem 0' }}>🛡️ Emergency Fund: {jobExitEmergencyFundProgress.toFixed(1)}%</p>
                <p style={{ margin: '0.25rem 0' }}>📈 Investment Rate: {((totalInvestments / totalIncome) * 100).toFixed(1)}%</p>
                <p style={{ margin: '0.25rem 0' }}>💳 Debt-to-Income: {((totalDebtPayments / totalIncome) * 100).toFixed(1)}%</p>
                {jobExitEmergencyFundProgress < 100 && jobExitMonthsToFullEmergencyFund < Infinity && (
                  <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', fontStyle: 'italic' }}>
                    ⏰ {jobExitMonthsToFullEmergencyFund} months to full emergency fund
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balances (if connected) */}
      {connectedAccounts.length > 0 && (
        <div className="card">
          <h3 className="card-title">Connected Accounts</h3>
          <div className="content-grid">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="metric-card blue">
                <div className="metric-flex">
                  <DollarSign className="metric-icon blue" />
                  <div className="metric-content">
                    <div className="blue">
                      <p>{account.institutionName}</p>
                      <p>{formatCurrency(totalAccountBalance)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="metric-card green">
              <div className="metric-flex">
                <TrendingUp className="metric-icon green" />
                <div className="metric-content">
                  <div className="green">
                    <p>Net Worth</p>
                    <p>{formatCurrency(totalAccountBalance - totalDebtBalance)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Health Overview */}
      <div className="content-grid">
        <div className="metric-card green">
          <div className="metric-flex">
            <DollarSign className="metric-icon green" />
            <div className="metric-content">
              <div className="green">
                <p>Monthly Income</p>
                <p>{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-card red">
          <div className="metric-flex">
            <AlertCircle className="metric-icon red" />
            <div className="metric-content">
              <div className="red">
                <p>Monthly Expenses</p>
                <p>{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-card blue">
          <div className="metric-flex">
            <TrendingUp className="metric-icon blue" />
            <div className="metric-content">
              <div className="blue">
                <p>Monthly Investing</p>
                <p>{formatCurrency(totalInvestments)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-card purple">
          <div className="metric-flex">
            <CheckCircle className="metric-icon purple" />
            <div className="metric-content">
              <div className="purple">
                <p>Available to Spend</p>
                <p>{formatCurrency(availableForSpending)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Debt Progress */}
      <div className="card">
        <h3 className="card-title">
          🎯 Debt Freedom Progress
        </h3>
        {totalDebtBalance > 0 ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="metric-card red">
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0', fontSize: '0.875rem', color: '#dc2626' }}>Total Debt</p>
                  <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                    {formatCurrency(totalDebtBalance)}
                  </p>
                </div>
              </div>
              
              <div className="metric-card blue">
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0', fontSize: '0.875rem', color: '#2563eb' }}>Monthly Payments</p>
                  <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                    {formatCurrency(totalDebtPayments)}
                  </p>
                </div>
              </div>
              
              <div className="metric-card green">
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0', fontSize: '0.875rem', color: '#059669' }}>Debt-Free Date</p>
                  <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>
                    {debtPayoffMonths} months
                  </p>
                  <p style={{ margin: '0', fontSize: '0.75rem', color: '#6b7280' }}>
                    {new Date(Date.now() + debtPayoffMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="metric-card purple">
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0', fontSize: '0.875rem', color: '#7c3aed' }}>Interest Cost</p>
                  <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 'bold', color: '#7c3aed' }}>
                    {formatCurrency(totalInterestSaved)}
                  </p>
                  <p style={{ margin: '0', fontSize: '0.75rem', color: '#6b7280' }}>
                    Total over life of loans
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Debt Payoff Progress</span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {debtPayoffMonths} months remaining
                </span>
              </div>
              <div className="progress-bar" style={{ height: '12px' }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.max(5, 100 - (debtPayoffMonths / 60) * 100)}%`,
                    background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)'
                  }}
                ></div>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #f59e0b' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>💡 Debt Acceleration Opportunity</h4>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#92400e' }}>
                With your {formatCurrency(availableForSpending)} monthly surplus, you could pay off debt 
                {Math.round((debtPayoffMonths - calculateDebtFreeDate(debts, availableForSpending)) || 0)} months faster 
                and save {formatCurrency(Math.max(0, totalInterestSaved - debts.reduce((sum, debt) => sum + calculateTotalInterest(debt.balance, debt.payment + (availableForSpending / debts.length), debt.interestRate), 0)))} 
                in interest!
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>Debt Free!</h3>
            <p style={{ margin: '0', color: '#6b7280' }}>
              Congratulations! You have no outstanding debts. 
              Consider redirecting those payments to investments or savings goals.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Job Exit Readiness */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="card-title">
            <Target className="card-icon" />
            Job Exit Readiness
          </h3>
          <button
            onClick={() => setShowJobExitSettings(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ⚙️ Settings
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Overall Readiness</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: overallReadiness >= 80 ? '#059669' : overallReadiness >= 60 ? '#f59e0b' : '#dc2626' }}>
              {overallReadiness.toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: '20px' }}>
            <div 
              className="progress-fill" 
              style={{ 
                width: `${overallReadiness}%`,
                background: overallReadiness >= 80 ? '#10b981' : overallReadiness >= 60 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Emergency Fund Progress */}
          <div>
            <div className="progress-info">
              <span>🛡️ Emergency Fund ({jobExitSettings.targetEmergencyFundMonths} months)</span>
              <span>{formatCurrency(jobExitCurrentEmergencyFund)} / {formatCurrency(jobExitEmergencyFundNeeded)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill green" 
                style={{ width: `${Math.min(jobExitEmergencyFundProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Side Income Progress */}
          <div>
            <div className="progress-info">
              <span>💼 Side Income Target</span>
              <span>{formatCurrency(jobExitSettings.currentSideIncome)} / {formatCurrency(jobExitSettings.targetSideIncome)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill blue" 
                style={{ width: `${Math.min(sideIncomeProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Account Balance Target */}
          <div>
            <div className="progress-info">
              <span>💰 Account Balance Target</span>
              <span>{formatCurrency(totalAccountBalance)} / {formatCurrency(jobExitSettings.targetAccountBalance)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill purple" 
                style={{ width: `${Math.min(accountBalanceProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="insight-box" style={{ marginTop: '1rem' }}>
          <p>
            <strong>CFO Insight:</strong> 
            {overallReadiness >= 80 ? ' You\'re ready to make the leap! Consider your exit strategy timeline.' :
             overallReadiness >= 60 ? ' You\'re on track! Focus on your weakest areas to accelerate progress.' :
             ' Building your foundation. Prioritize emergency fund and debt reduction.'
            }
            {jobExitEmergencyFundProgress < 100 && jobExitMonthsToFullEmergencyFund < Infinity && 
              ` ${jobExitMonthsToFullEmergencyFund} months to full emergency fund at current savings rate.`
            }
          </p>
        </div>
      </div>

      {/* Job Exit Settings Modal */}
      {showJobExitSettings && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Job Exit Readiness Settings</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Emergency Fund Target (months of expenses):
                </label>
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={jobExitSettings.targetEmergencyFundMonths}
                  onChange={(e) => setJobExitSettings({...jobExitSettings, targetEmergencyFundMonths: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Side Income Target (monthly):
                </label>
                <input
                  type="number"
                  value={jobExitSettings.targetSideIncome}
                  onChange={(e) => setJobExitSettings({...jobExitSettings, targetSideIncome: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Current Side Income (monthly):
                </label>
                <input
                  type="number"
                  value={jobExitSettings.currentSideIncome}
                  onChange={(e) => setJobExitSettings({...jobExitSettings, currentSideIncome: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Account Balance Target:
                </label>
                <input
                  type="number"
                  value={jobExitSettings.targetAccountBalance}
                  onChange={(e) => setJobExitSettings({...jobExitSettings, targetAccountBalance: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Risk Tolerance:
                </label>
                <select
                  value={jobExitSettings.riskTolerance}
                  onChange={(e) => setJobExitSettings({...jobExitSettings, riskTolerance: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                >
                  <option value="low">Conservative (12+ months emergency fund)</option>
                  <option value="medium">Moderate (6-9 months emergency fund)</option>
                  <option value="high">Aggressive (3-6 months emergency fund)</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowJobExitSettings(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowJobExitSettings(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions (if connected) */}
      {transactions.length > 0 && (
        <div className="card">
          <h3 className="card-title">Recent Transactions</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="budget-item">
                <div>
                  <span style={{ fontWeight: '500' }}>{transaction.name}</span>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {transaction.date} • {transaction.category?.[0]}
                  </div>
                </div>
                <span style={{ 
                  color: transaction.amount > 0 ? '#059669' : '#dc2626',
                  fontWeight: '600'
                }}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Allocation */}
      <div className="card">
        <h3 className="card-title">Budget Allocation</h3>
        <div>
          <div className="allocation-item">
            <span>Essential Expenses</span>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill red" 
                  style={{ width: `${(totalExpenses / totalIncome) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">{((totalExpenses / totalIncome) * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="allocation-item">
            <span>Investments</span>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill blue" 
                  style={{ width: `${(totalInvestments / totalIncome) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">{((totalInvestments / totalIncome) * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="allocation-item">
            <span>Flexible Spending</span>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill green" 
                  style={{ width: `${(availableForSpending / totalIncome) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">{((availableForSpending / totalIncome) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Income Tracker Component
  const IncomeTracker = () => (
    <div>
      <div className="card">
        <h3 className="card-title">Income Streams</h3>
        <div>
          {incomeStreams.map((stream, index) => (
            <div key={index} className="list-item">
              {editingIncome === index ? (
                <div style={{ display: 'flex', width: '100%', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={stream.name}
                    onChange={(e) => {
                      const updated = [...incomeStreams];
                      updated[index].name = e.target.value;
                      setIncomeStreams(updated);
                    }}
                    style={{ flex: '1', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                  />
                  <input
                    type="number"
                    value={stream.amount}
                    onChange={(e) => {
                      const updated = [...incomeStreams];
                      updated[index].amount = Number(e.target.value);
                      setIncomeStreams(updated);
                    }}
                    style={{ width: '120px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                  />
                  <input
                    type="text"
                    value={stream.date}
                    onChange={(e) => {
                      const updated = [...incomeStreams];
                      updated[index].date = e.target.value;
                      setIncomeStreams(updated);
                    }}
                    style={{ width: '100px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                  />
                  <button
                    onClick={() => setEditingIncome(null)}
                    style={{ padding: '0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditingIncome(null)}
                    style={{ padding: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h4>{stream.name}</h4>
                    <p>Paid on: {stream.date}</p>
                  </div>
                  <div className="list-item-right">
                    <p>{formatCurrency(stream.amount)}</p>
                    <p>{stream.frequency}</p>
                  </div>
                  <button
                    onClick={() => setEditingIncome(index)}
                    style={{ 
                      marginLeft: '0.5rem', 
                      padding: '0.5rem', 
                      backgroundColor: '#f3f4f6', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.25rem', 
                      cursor: 'pointer' 
                    }}
                  >
                    <Edit3 size={16} />
                  </button>
                </>
              )}
            </div>
          ))}
          
          <div className="list-total">
            <div className="list-total-flex">
              <span>Total Monthly Income</span>
              <span>{formatCurrency(totalIncome)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Budget Allocator Component
const BudgetAllocator = () => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', priority: 1 });
  const [newInvestment, setNewInvestment] = useState({ name: '', amount: '' });

  // Calculate debt payments total
  const totalDebtPayments = debts.reduce((sum, debt) => sum + debt.payment, 0);

  // Calculate non-debt expenses
  const nonDebtExpenses = expenses.filter(expense => 
    !['Student Loans', 'RV Payment', 'Suburban Payment', 'Tesla Payment'].includes(expense.category)
  );
  const totalNonDebtExpenses = nonDebtExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const addNewExpense = () => {
    if (newExpense.category && newExpense.amount) {
      const expense = {
        category: newExpense.category,
        amount: Number(newExpense.amount),
        priority: Number(newExpense.priority)
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ category: '', amount: '', priority: 1 });
      setShowAddExpense(false);
    }
  };

  const addNewInvestment = () => {
    if (newInvestment.name && newInvestment.amount) {
      const investment = {
        name: newInvestment.name,
        amount: Number(newInvestment.amount)
      };
      setInvestments([...investments, investment]);
      setNewInvestment({ name: '', amount: '' });
      setShowAddInvestment(false);
    }
  };

  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const removeInvestment = (index) => {
    setInvestments(investments.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">Budget Breakdown</h3>
        
        <div>
          {/* Priority 1: Essential Bills (Non-Debt) */}
          <div className="budget-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4>Priority 1: Essential Bills</h4>
              <button
                onClick={() => setShowAddExpense(true)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                + Add Expense
              </button>
            </div>
            
            <div>
              {nonDebtExpenses.map((expense, index) => {
                const originalIndex = expenses.findIndex(e => e === expense);
                return (
                  <div key={originalIndex} className="budget-item">
                    {editingExpense === originalIndex ? (
                      <div style={{ display: 'flex', width: '100%', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={expense.category}
                          onChange={(e) => {
                            const updated = [...expenses];
                            updated[originalIndex].category = e.target.value;
                            setExpenses(updated);
                          }}
                          style={{ flex: '1', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                        />
                        <input
                          type="number"
                          value={expense.amount}
                          onChange={(e) => {
                            const updated = [...expenses];
                            updated[originalIndex].amount = Number(e.target.value);
                            setExpenses(updated);
                          }}
                          style={{ width: '100px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                        />
                        <button
                          onClick={() => setEditingExpense(null)}
                          style={{ padding: '0.25rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => setEditingExpense(null)}
                          style={{ padding: '0.25rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>{expense.category}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{formatCurrency(expense.amount)}</span>
                          <button
                            onClick={() => setEditingExpense(originalIndex)}
                            style={{ 
                              padding: '0.25rem', 
                              backgroundColor: 'transparent', 
                              border: '1px solid #d1d5db', 
                              borderRadius: '0.25rem', 
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => removeExpense(originalIndex)}
                            style={{ 
                              padding: '0.25rem', 
                              backgroundColor: '#ef4444', 
                              color: 'white',
                              border: 'none', 
                              borderRadius: '0.25rem', 
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              <div className="budget-subtotal">
                <span>Essential Bills Subtotal</span>
                <span>{formatCurrency(totalNonDebtExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Priority 2: Debt Payments */}
          <div className="budget-section">
            <h4>Priority 2: Debt Payments</h4>
            <div>
              {debts.map((debt, index) => (
                <div key={index} className="budget-item">
                  <span>{debt.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{formatCurrency(debt.payment)}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      ({debt.interestRate}% APR)
                    </span>
                  </div>
                </div>
              ))}
              <div className="budget-subtotal">
                <span>Debt Payments Subtotal</span>
                <span>{formatCurrency(totalDebtPayments)}</span>
              </div>
            </div>
          </div>

          {/* Priority 3: Investments */}
          <div className="budget-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4>Priority 3: Investments</h4>
              <button
                onClick={() => setShowAddInvestment(true)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                + Add Investment
              </button>
            </div>
            
            <div>
              {investments.map((investment, index) => (
                <div key={index} className="budget-item">
                  {editingInvestment === index ? (
                    <div style={{ display: 'flex', width: '100%', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={investment.name}
                        onChange={(e) => {
                          const updated = [...investments];
                          updated[index].name = e.target.value;
                          setInvestments(updated);
                        }}
                        style={{ flex: '1', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                      />
                      <input
                        type="number"
                        value={investment.amount}
                        onChange={(e) => {
                          const updated = [...investments];
                          updated[index].amount = Number(e.target.value);
                          setInvestments(updated);
                        }}
                        style={{ width: '100px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                      />
                      <button
                        onClick={() => setEditingInvestment(null)}
                        style={{ padding: '0.25rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => setEditingInvestment(null)}
                        style={{ padding: '0.25rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span>{investment.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{formatCurrency(investment.amount)}</span>
                        <button
                          onClick={() => setEditingInvestment(index)}
                          style={{ 
                            padding: '0.25rem', 
                            backgroundColor: 'transparent', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '0.25rem', 
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => removeInvestment(index)}
                          style={{ 
                            padding: '0.25rem', 
                            backgroundColor: '#ef4444', 
                            color: 'white',
                            border: 'none', 
                            borderRadius: '0.25rem', 
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="budget-subtotal">
                <span>Investments Subtotal</span>
                <span>{formatCurrency(totalInvestments)}</span>
              </div>
            </div>
          </div>

          {/* Priority 4: Flexible Spending */}
          <div className="flexible-spending">
            <h4>Priority 4: Flexible Spending</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
              {formatCurrency(availableForSpending)}
            </p>
            <p>Available for discretionary spending, extra debt payments, or additional savings</p>
            
            {/* Suggested allocations */}
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#065f46' }}>💡 CFO Suggestions:</h5>
              <div style={{ fontSize: '0.875rem', color: '#047857' }}>
                <p style={{ margin: '0.25rem 0' }}>
                  • Emergency Fund: {formatCurrency(availableForSpending * 0.3)} (30%)
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  • Extra Debt Payment: {formatCurrency(availableForSpending * 0.4)} (40%)
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  • Fun Money: {formatCurrency(availableForSpending * 0.3)} (30%)
                </p>
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f8fafc', 
            borderRadius: '0.5rem',
            border: '2px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Monthly Budget Summary</h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📥 Total Income:</span>
                <span style={{ fontWeight: 'bold', color: '#059669' }}>
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🏠 Essential Bills:</span>
                <span>{formatCurrency(totalNonDebtExpenses)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>💳 Debt Payments:</span>
                <span>{formatCurrency(totalDebtPayments)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📈 Investments:</span>
                <span>{formatCurrency(totalInvestments)}</span>
              </div>
              <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #d1d5db' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
                <span>💰 Available for Flexible Spending:</span>
                <span style={{ color: availableForSpending >= 0 ? '#059669' : '#dc2626' }}>
                  {formatCurrency(availableForSpending)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Expense Modal */}
      {showAddExpense && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Add New Expense</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Category:
                </label>
                <input
                  type="text"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  placeholder="e.g., Gym Membership, Streaming Services"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Monthly Amount:
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="50"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddExpense(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addNewExpense}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Investment Modal */}
      {showAddInvestment && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Add New Investment</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Investment Name:
                </label>
                <input
                  type="text"
                  value={newInvestment.name}
                  onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                  placeholder="e.g., 401k, Roth IRA, Crypto"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Monthly Amount:
                </label>
                <input
                  type="number"
                  value={newInvestment.amount}
                  onChange={(e) => setNewInvestment({...newInvestment, amount: e.target.value})}
                  placeholder="500"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddInvestment(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addNewInvestment}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Add Investment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  // Enhanced Debt Simulator Component with Add New Debt functionality
const DebtSimulator = () => {
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: '',
    balance: '',
    payment: '',
    interestRate: '',
    minPayment: ''
  });

  const addNewDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.payment && newDebt.interestRate) {
      const debt = {
        name: newDebt.name,
        balance: Number(newDebt.balance),
        payment: Number(newDebt.payment),
        interestRate: Number(newDebt.interestRate),
        minPayment: Number(newDebt.minPayment || newDebt.payment)
      };
      setDebts([...debts, debt]);
      setNewDebt({ name: '', balance: '', payment: '', interestRate: '', minPayment: '' });
      setShowAddDebt(false);
    }
  };

  const removeDebt = (index) => {
    setDebts(debts.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="card-title">Current Debt Overview</h3>
          <button
            onClick={() => setShowAddDebt(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            + Add New Debt
          </button>
        </div>

        {/* Add New Debt Modal/Form */}
        {showAddDebt && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0' }}>Add New Debt</h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Debt Name:
                  </label>
                  <input
                    type="text"
                    value={newDebt.name}
                    onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                    placeholder="e.g., Credit Card, Personal Loan"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Current Balance:
                    </label>
                    <input
                      type="number"
                      value={newDebt.balance}
                      onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})}
                      placeholder="25000"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Interest Rate (%):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newDebt.interestRate}
                      onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})}
                      placeholder="5.5"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Current Monthly Payment:
                    </label>
                    <input
                      type="number"
                      value={newDebt.payment}
                      onChange={(e) => setNewDebt({...newDebt, payment: e.target.value})}
                      placeholder="500"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Minimum Payment:
                    </label>
                    <input
                      type="number"
                      value={newDebt.minPayment}
                      onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})}
                      placeholder="(optional - defaults to current payment)"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddDebt(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={addNewDebt}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Add Debt
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content-grid">
          {debts.map((debt, index) => (
            <div key={index} className="metric-card red">
              <div style={{ padding: '0.5rem 0' }}>
                {editingDebt === index ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={debt.name}
                      onChange={(e) => {
                        const updated = [...debts];
                        updated[index].name = e.target.value;
                        setDebts(updated);
                      }}
                      style={{ padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Balance:</label>
                        <input
                          type="number"
                          value={debt.balance}
                          onChange={(e) => {
                            const updated = [...debts];
                            updated[index].balance = Number(e.target.value);
                            setDebts(updated);
                          }}
                          style={{ width: '100%', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rate %:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={debt.interestRate}
                          onChange={(e) => {
                            const updated = [...debts];
                            updated[index].interestRate = Number(e.target.value);
                            setDebts(updated);
                          }}
                          style={{ width: '100%', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.75rem' }}
                        />
                      </div>
                    </div>
                    <input
                      type="number"
                      value={debt.payment}
                      onChange={(e) => {
                        const updated = [...debts];
                        updated[index].payment = Number(e.target.value);
                        setDebts(updated);
                      }}
                      placeholder="Monthly Payment"
                      style={{ padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.75rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => setEditingDebt(null)}
                        style={{ padding: '0.25rem 0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        <Save size={12} />
                      </button>
                      <button
                        onClick={() => setEditingDebt(null)}
                        style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: '0', fontWeight: '600' }}>{debt.name}</h4>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => setEditingDebt(index)}
                          style={{ 
                            padding: '0.25rem', 
                            backgroundColor: 'rgba(255,255,255,0.8)', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '0.25rem', 
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => removeDebt(index)}
                          style={{ 
                            padding: '0.25rem', 
                            backgroundColor: '#ef4444', 
                            color: 'white',
                            border: 'none', 
                            borderRadius: '0.25rem', 
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {formatCurrency(debt.balance)}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatCurrency(debt.payment)}/month • {debt.interestRate}% APR
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                      Payoff: {calculatePayoffTime(debt.balance, debt.payment, debt.interestRate)} months
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rest of your existing debt simulator code... */}
      <div className="card">
        <h3 className="card-title">Payoff Strategies</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Current Path (Minimum Payments)</h4>
            <p><strong>Time to debt freedom:</strong> {calculateDebtFreeDate(debts)} months</p>
            <p><strong>Total interest paid:</strong> {formatCurrency(
              debts.reduce((sum, debt) => sum + calculateTotalInterest(debt.balance, debt.payment, debt.interestRate), 0)
            )}</p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Debt Avalanche (+{formatCurrency(Math.min(extraPayment, availableForSpending))})</h4>
            <p><strong>Time to debt freedom:</strong> {calculateDebtFreeDate(debts, Math.min(extraPayment, availableForSpending))} months</p>
            <p><strong>Interest saved:</strong> {formatCurrency(
              debts.reduce((sum, debt) => sum + calculateTotalInterest(debt.balance, debt.payment, debt.interestRate), 0) -
              debts.reduce((sum, debt) => sum + calculateTotalInterest(debt.balance, debt.payment + (Math.min(extraPayment, availableForSpending) / debts.length), debt.interestRate), 0)
            )}</p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Focus extra payment on highest interest rate debt first</p>
          </div>
        </div>
      </div>

      {/* Interactive Simulator */}
      <div className="card">
        <h3 className="card-title">What-If Simulator</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
            Extra Monthly Payment Amount:
          </label>
          <input
            type="range"
            min="0"
            max={availableForSpending}
            step="100"
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
            <span>$0</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{formatCurrency(extraPayment)}</span>
            <span>{formatCurrency(availableForSpending)} (max available)</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
            Apply extra payment to:
          </label>
          <select 
            value={selectedDebt}
            onChange={(e) => setSelectedDebt(Number(e.target.value))}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem',
              fontSize: '1rem'
            }}
          >
            <option value={-1}>Split evenly across all debts</option>
            {debts.map((debt, index) => (
              <option key={index} value={index}>
                {debt.name} ({debt.interestRate}% APR)
              </option>
            ))}
          </select>
        </div>

        <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#065f46' }}>Simulation Results</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#047857' }}>Time to debt freedom:</p>
              <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 'bold', color: '#065f46' }}>
                {calculateDebtFreeDate(debts, extraPayment)} months
              </p>
            </div>
            <div>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#047857' }}>Monthly payment total:</p>
              <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 'bold', color: '#065f46' }}>
                {formatCurrency(debts.reduce((sum, debt) => sum + debt.payment, 0) + extraPayment)}
              </p>
            </div>
            <div>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#047857' }}>Interest saved:</p>
              <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 'bold', color: '#065f46' }}>
                {formatCurrency(Math.max(0, 
                  debts.reduce((sum, debt) => sum + calculateTotalInterest(debt.balance, debt.payment, debt.interestRate), 0) -
                  debts.reduce((sum, debt) => sum + calculateTotalInterest(debt.balance, debt.payment + (extraPayment / debts.length), debt.interestRate), 0)
                ))}
              </p>
            </div>
          </div>
        </div>

        {extraPayment > availableForSpending && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
            <p style={{ margin: '0', fontSize: '0.875rem', color: '#dc2626' }}>
              ⚠️ This payment exceeds your available surplus of {formatCurrency(availableForSpending)}. 
              You'd need to cut other expenses or increase income.
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">CFO Insights & Quick Wins</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>🎯 Highest Impact Move</h4>
            <p style={{ margin: '0', fontSize: '0.875rem' }}>
              Pay an extra {formatCurrency(1000)} toward your highest interest debt to save 
              {formatCurrency(5000)} in interest over the life of the loan.
            </p>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>💡 Smart Strategy</h4>
            <p style={{ margin: '0', fontSize: '0.875rem' }}>
              With your {formatCurrency(availableForSpending)} monthly surplus, you could be debt-free in 
              {calculateDebtFreeDate(debts, availableForSpending)} months instead of {calculateDebtFreeDate(debts)} months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Decision Simulator Component
const DecisionSimulator = () => {
  const baseIncome = totalIncome;
  const baseExpenses = totalExpenses + totalInvestments;
  
  // Add state for managing custom scenarios
  const [customScenarios, setCustomScenarios] = useState(() => 
    loadData('customScenarios', [])
  );
  const [showAddScenario, setShowAddScenario] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    type: 'custom',
    upfrontCost: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    duration: 12,
    startMonth: 1
  });

  // Save custom scenarios when they change
  useEffect(() => {
    saveData('customScenarios', customScenarios);
  }, [customScenarios]);

  const simulation = simulateScenario(baseIncome, baseExpenses, scenario);
  const insights = getScenarioInsights(simulation, scenario);

  const presetScenarios = [
    {
      name: 'Hire Developer',
      type: 'business_investment',
      upfrontCost: 7000,
      monthlyIncome: 300,
      monthlyExpense: 0,
      duration: 6,
      startMonth: 1,
      description: 'Invest $7K in development, expect $300/month revenue'
    },
    {
      name: 'Quit Job (12 months)',
      type: 'job_exit',
      upfrontCost: 0,
      monthlyIncome: -14302.76,
      monthlyExpense: 0,
      duration: 12,
      startMonth: 12,
      description: 'Stop salary income after 12 months, live off savings'
    },
    {
      name: 'Sell Tesla & Invest',
      type: 'asset_sale',
      upfrontCost: -25000,
      monthlyIncome: 500,
      monthlyExpense: -1199.96,
      duration: 24,
      startMonth: 1,
      description: 'Sell Tesla, invest proceeds, eliminate payment'
    },
    {
      name: 'Side Hustle Growth',
      type: 'income_change',
      upfrontCost: 1000,
      monthlyIncome: 1500,
      monthlyExpense: 200,
      duration: 24,
      startMonth: 3,
      description: 'Build side business to $1500/month net'
    }
  ];



  const addCustomScenario = () => {
    if (newScenario.name && newScenario.duration) {
      const scenario = {
        ...newScenario,
        id: Date.now().toString(),
        upfrontCost: Number(newScenario.upfrontCost),
        monthlyIncome: Number(newScenario.monthlyIncome),
        monthlyExpense: Number(newScenario.monthlyExpense),
        duration: Number(newScenario.duration),
        startMonth: Number(newScenario.startMonth)
      };
      setCustomScenarios([...customScenarios, scenario]);
      setNewScenario({
        name: '',
        description: '',
        type: 'custom',
        upfrontCost: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        duration: 12,
        startMonth: 1
      });
      setShowAddScenario(false);
    }
  };

  const deleteCustomScenario = (scenarioId) => {
    setCustomScenarios(customScenarios.filter(s => s.id !== scenarioId));
    // If we're currently viewing the deleted scenario, switch to first preset
    if (scenario.id === scenarioId) {
      setScenario(presetScenarios[0]);
    }
  };

  const duplicateScenario = (scenarioToDuplicate) => {
    const duplicated = {
      ...scenarioToDuplicate,
      id: Date.now().toString(),
      name: `${scenarioToDuplicate.name} (Copy)`,
      type: 'custom'
    };
    setCustomScenarios([...customScenarios, duplicated]);
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 className="card-title">Decision Simulator</h3>
            <p style={{ margin: '0', color: '#6b7280' }}>
              Model financial decisions and see their long-term impact on your cash flow and goals.
            </p>
          </div>
          <button
            onClick={() => setShowAddScenario(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            + Create Custom Scenario
          </button>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
            Choose a scenario:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
            {/* Preset Scenarios */}
            {presetScenarios.map((preset, index) => (
              <div
                key={index}
                onClick={() => setScenario(preset)}
                style={{
                  padding: '0.75rem',
                  border: scenario.name === preset.name ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: scenario.name === preset.name ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  position: 'relative'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {preset.name}
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#e5e7eb', 
                    color: '#374151',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    marginLeft: '0.5rem'
                  }}>
                    Preset
                  </span>
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{preset.description}</div>
              </div>
            ))}

            {/* Custom Scenarios */}
            {customScenarios.map((customScen, index) => (
              <div
                key={customScen.id}
                style={{
                  padding: '0.75rem',
                  border: scenario.name === customScen.name ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: scenario.name === customScen.name ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  position: 'relative'
                }}
              >
                <div 
                  onClick={() => setScenario(customScen)}
                  style={{ marginBottom: '0.5rem' }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {customScen.name}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      backgroundColor: '#dbeafe', 
                      color: '#1e40af',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      marginLeft: '0.5rem'
                    }}>
                      Custom
                    </span>
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    {customScen.description || 'Custom scenario'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateScenario(customScen);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingScenario(customScen);
                      setNewScenario({...customScen});
                      setShowAddScenario(true);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomScenario(customScen.id);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Custom Scenario Modal */}
      {showAddScenario && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>
              {editingScenario ? 'Edit Scenario' : 'Create Custom Scenario'}
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Scenario Name: *
                  </label>
                  <input
                    type="text"
                    value={newScenario.name}
                    onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}
                    placeholder="e.g., Buy Rental Property, Start Freelancing"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Category:
                  </label>
                  <select
                    value={newScenario.type}
                    onChange={(e) => setNewScenario({...newScenario, type: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  >
                    <option value="custom">Custom</option>
                    <option value="business_investment">Business Investment</option>
                    <option value="job_change">Job Change</option>
                    <option value="asset_purchase">Asset Purchase</option>
                    <option value="asset_sale">Asset Sale</option>
                    <option value="education">Education</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="lifestyle">Lifestyle Change</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Description:
                </label>
                <textarea
                  value={newScenario.description}
                  onChange={(e) => setNewScenario({...newScenario, description: e.target.value})}
                  placeholder="Brief description of this scenario..."
                  rows="2"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Upfront Cost/Income:
                  </label>
                  <input
                    type="number"
                    value={newScenario.upfrontCost}
                    onChange={(e) => setNewScenario({...newScenario, upfrontCost: e.target.value})}
                    placeholder="0 (negative for income)"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                  <small style={{ color: '#6b7280' }}>Positive = cost, Negative = income</small>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Start Month:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={newScenario.startMonth}
                    onChange={(e) => setNewScenario({...newScenario, startMonth: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Monthly Income Change:
                  </label>
                  <input
                    type="number"
                    value={newScenario.monthlyIncome}
                    onChange={(e) => setNewScenario({...newScenario, monthlyIncome: e.target.value})}
                    placeholder="0"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Monthly Expense Change:
                  </label>
                  <input
                    type="number"
                    value={newScenario.monthlyExpense}
                    onChange={(e) => setNewScenario({...newScenario, monthlyExpense: e.target.value})}
                    placeholder="0"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Duration (months): *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={newScenario.duration}
                    onChange={(e) => setNewScenario({...newScenario, duration: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
              </div>

              {/* Quick Presets for Common Scenarios */}
              <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                  📋 Quick Presets:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    { name: 'Real Estate Investment', upfront: 50000, income: 1500, expense: 800, duration: 240 },
                    { name: 'New Car Purchase', upfront: 25000, income: 0, expense: 450, duration: 60 },
                    { name: 'Freelance Business', upfront: 2000, income: 2500, expense: 500, duration: 12 },
                    { name: 'Emergency Fund Build', upfront: 0, income: 0, expense: 1000, duration: 6 },
                    { name: 'Education/Certification', upfront: 5000, income: 500, expense: 0, duration: 24 }
                  ].map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setNewScenario({
                        ...newScenario,
                        name: preset.name,
                        upfrontCost: preset.upfront,
                        monthlyIncome: preset.income,
                        monthlyExpense: preset.expense,
                        duration: preset.duration
                      })}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddScenario(false);
                  setEditingScenario(null);
                  setNewScenario({
                    name: '',
                    description: '',
                    type: 'custom',
                    upfrontCost: 0,
                    monthlyIncome: 0,
                    monthlyExpense: 0,
                    duration: 12,
                    startMonth: 1
                  });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingScenario) {
                    // Update existing scenario
                    setCustomScenarios(customScenarios.map(s => 
                      s.id === editingScenario.id ? {...newScenario, id: editingScenario.id} : s
                    ));
                    setScenario({...newScenario, id: editingScenario.id});
                    setEditingScenario(null);
                  } else {
                    // Add new scenario
                    addCustomScenario();
                  }
                  setShowAddScenario(false);
                }}
                disabled={!newScenario.name || !newScenario.duration}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: (!newScenario.name || !newScenario.duration) ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: (!newScenario.name || !newScenario.duration) ? 'not-allowed' : 'pointer'
                }}
              >
                {editingScenario ? 'Update Scenario' : 'Create Scenario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the existing simulator UI - Scenario Details, Results, etc. */}
      <div className="card">
        <h3 className="card-title">Scenario Details: {scenario.name}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
              Upfront Cost:
            </label>
            <input
              type="number"
              value={scenario.upfrontCost}
              onChange={(e) => setScenario({...scenario, upfrontCost: Number(e.target.value)})}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem' 
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
              Monthly Income Change:
            </label>
            <input
              type="number"
              value={scenario.monthlyIncome}
              onChange={(e) => setScenario({...scenario, monthlyIncome: Number(e.target.value)})}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem' 
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
              Monthly Expense Change:
            </label>
            <input
              type="number"
              value={scenario.monthlyExpense}
              onChange={(e) => setScenario({...scenario, monthlyExpense: Number(e.target.value)})}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem' 
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
              Duration (months):
            </label>
            <input
              type="number"
              value={scenario.duration}
              onChange={(e) => setScenario({...scenario, duration: Number(e.target.value)})}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Simulation Results */}
      <div className="card">
        <h3 className="card-title">Simulation Results</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: insights.riskLevel === 'Low' ? '#f0fdf4' : insights.riskLevel === 'Medium' ? '#fffbeb' : '#fef2f2',
            borderRadius: '0.5rem',
            border: `1px solid ${insights.riskLevel === 'Low' ? '#bbf7d0' : insights.riskLevel === 'Medium' ? '#fed7aa' : '#fecaca'}`
          }}>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Risk Level</p>
            <p style={{ 
              margin: '0', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              color: insights.riskLevel === 'Low' ? '#065f46' : insights.riskLevel === 'Medium' ? '#92400e' : '#dc2626'
            }}>
              {insights.riskLevel}
            </p>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Break Even</p>
            <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {insights.breakEvenMonth === 'Never' ? 'Never' : `Month ${insights.breakEvenMonth}`}
            </p>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '500' }}>12-Month Impact</p>
            <p style={{ 
              margin: '0', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              color: insights.month12CashFlow >= 0 ? '#065f46' : '#dc2626'
            }}>
              {formatCurrency(insights.month12CashFlow)}
            </p>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '500' }}>24-Month ROI</p>
            <p style={{ 
              margin: '0', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              color: insights.totalROI >= 0 ? '#065f46' : '#dc2626'
            }}>
              {formatCurrency(insights.totalROI)}
            </p>
          </div>
        </div>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: insights.isViable ? '#f0fdf4' : '#fef2f2',
          borderRadius: '0.5rem',
          border: `1px solid ${insights.isViable ? '#bbf7d0' : '#fecaca'}`,
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            color: insights.isViable ? '#065f46' : '#dc2626' 
          }}>
            CFO Recommendation: {insights.isViable ? '✅ Proceed with Caution' : '❌ High Risk - Reconsider'}
          </h4>
          <p style={{ margin: '0', fontSize: '0.875rem' }}>
            {insights.isViable 
              ? `This scenario shows positive returns within ${insights.breakEvenMonth} months. ${insights.emergencyFundRisk ? 'Monitor emergency fund levels closely.' : 'Emergency fund remains stable.'}`
              : `This scenario has significant risks. ${insights.breakEvenMonth === 'Never' ? 'No break-even point identified.' : `Break-even takes ${insights.breakEvenMonth} months.`} Consider reducing costs or increasing revenue projections.`
            }
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem' }}>24-Month Cash Flow Projection</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(12, 1fr)', 
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}>
            {simulation.slice(0, 12).map((month, index) => (
              <div 
                key={index}
                style={{
                  height: '40px',
                  backgroundColor: month.cumulativeCashFlow >= 0 ? '#10b981' : '#ef4444',
                  borderRadius: '2px',
                  position: 'relative',
                  opacity: Math.abs(month.cumulativeCashFlow) / 20000 + 0.3
                }}
                title={`Month ${month.month}: ${formatCurrency(month.cumulativeCashFlow)}`}
              >
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'white', 
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}>
                  {month.month}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280' }}>
            <span>Months 1-12</span>
            <span>Green = Positive | Red = Negative</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Quick Decision Framework</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>✅ Green Light If:</h4>
            <ul style={{ margin: '0', paddingLeft: '1rem', fontSize: '0.875rem' }}>
              <li>Break-even within 12 months</li>
              <li>Emergency fund stays above $2K</li>
              <li>Positive 24-month ROI</li>
              <li>Monthly surplus remains positive</li>
            </ul>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>🟡 Proceed with Caution If:</h4>
            <ul style={{ margin: '0', paddingLeft: '1rem', fontSize: '0.875rem' }}>
              <li>Break-even 12-18 months</li>
              <li>Emergency fund dips below $5K</li>
              <li>Requires cutting other expenses</li>
              <li>Revenue assumptions are optimistic</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Main App Return Statement
  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-flex">
            <div>
              <h1 className="header-title">Life CFO</h1>
              <p className="header-subtitle">Your Personal Financial Command Center</p>
            </div>
            <div className="header-stats">
              <p>Net Monthly Surplus</p>
              <p>{formatCurrency(availableForSpending)}</p>
              {connectedAccounts.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                  🔗 {connectedAccounts.length} account(s) connected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-container">
        <div className="nav-border">
          <nav className="nav-flex">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'income', name: 'Income Tracker', icon: DollarSign },
              { id: 'budget', name: 'Budget Allocator', icon: Calendar },
              { id: 'debt', name: 'Debt Simulator', icon: Target },
              { id: 'decisions', name: 'Decision Simulator', icon: AlertCircle },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'income' && <IncomeTracker />}
        {activeTab === 'budget' && <BudgetAllocator />}
        {activeTab === 'debt' && <DebtSimulator />}
        {activeTab === 'decisions' && <DecisionSimulator />}
        {activeTab === 'settings' && <SettingsPage />}
      </div>
    </div>
  );
};

export default LifeCFO;