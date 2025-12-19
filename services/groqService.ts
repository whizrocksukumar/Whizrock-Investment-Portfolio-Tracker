import { CalculatedStock, PortfolioSummary } from '../types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const generatePortfolioAnalysis = async (
  apiKey: string,
  stocks: CalculatedStock[],
  portfolio: PortfolioSummary,
  formatCurrency: (value: number) => string
): Promise<string> => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const prompt = `Based on current market data as of ${today}, analyze this investment portfolio:

Total Investment: ${formatCurrency(portfolio.totalInvestment)}
Current Value: ${formatCurrency(portfolio.currentValue)}
Total P&L: ${formatCurrency(portfolio.totalPandL)} (${portfolio.avgAnnualReturn.toFixed(2)}%)

Holdings:
${stocks.map(s => `- ${s.stock.companyName} (${s.stock.id}): ${s.quantity} shares, P&L: ${formatCurrency(s.pAndL)}`).join('\n')}

Provide investment analysis and recommendations. Reason briefly.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate analysis';
  } catch (error) {
    console.error('Error generating analysis:', error);
    return 'Error generating analysis. Please try again.';
  }
};

export const generateStockAnalysis = async (
  apiKey: string,
  stock: CalculatedStock,
  formatCurrency: (value: number) => string
): Promise<string> => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const prompt = `Based on current market data as of ${today}, recommend retain or sell for ${stock.stock.companyName} (${stock.stock.id}), considering news, performance, and P&L of ${formatCurrency(stock.pAndL)}. Reason briefly.

Current Holdings: ${stock.quantity} shares
Investment Cost: ${formatCurrency(stock.investment)}
Current Value: ${formatCurrency(stock.currentValue)}
P&L: ${formatCurrency(stock.pAndL)}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate analysis';
  } catch (error) {
    console.error('Error generating stock analysis:', error);
    return 'Error generating analysis. Please try again.';
  }
};
