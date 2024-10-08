export type QUOTE = {
  symbol: string;
  name: string;
  exchange: string;
  mic_code: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previous_close: number;
  change: number;
  percent_change: number;
  average_volume: number;
  is_market_open: boolean;
  fifty_two_week: {
    high: number;
    low: number;
  };
};
