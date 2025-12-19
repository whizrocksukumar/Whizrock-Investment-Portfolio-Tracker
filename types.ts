
export type Owner = string;

export enum TransactionAction {
  Buy = "Buy",
  Sell = "Sell",
}

export interface Transaction {
  id: string | number;
  stockId: string;
  companyName: string;
  ISINCode: string;
  owner: Owner;
  action: TransactionAction;
  quantity: number;
  transactionPrice: number;
  brokerage: number;
  stampDuty: number;
  transactionCharges: number;
  exchange: string;
  broker: string;
  transactionDate: string;
  userEmail?: string; // Track who recorded this transaction
}

export interface Stock {
  id: string;
  companyName: string;
  currentPrice: number;
}

export interface CalculatedStock {
  stock: Stock;
  transactions: Transaction[];
  quantity: number;
  investment: number;
  currentValue: number;
  pAndL: number;
  avgAnnualReturn: number;
  firstTransactionDate: string;
  recommendation: {
    text: 'Hold' | 'Sell';
    style: string;
  };
}

export interface PortfolioSummary {
  totalInvestment: number;
  currentValue: number;
  totalPandL: number;
  avgAnnualReturn: number;
}
