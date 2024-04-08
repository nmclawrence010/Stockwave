export async function fetchStockData(ticker: string) {
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=" +
      process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY +
      "&interval=1min&symbol=" +
      ticker +
      "&dp=2&" +
      "format=JSON&outputsize=12",
  );
  setTimeout(() => {
    console.log("Waiting...");
  }, 800);
  const data = await res.json();
  //const finalPrice = data.values[0].close; //Returns just the last price of the stock
  // console.log("VALUES", data.values[0]);
  return data;
}

export async function fetchLogo(ticker: string) {
  const res = await fetch("https://api.twelvedata.com/logo?symbol=" + ticker + "&apikey=" + process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY);
  const logoLink = await res.json();
  const logoURL = logoLink.url; //Returns just the URL link to the company logo
  //console.log("LOGO", logoURL);
  return logoURL;
}

// https://twelvedata.com/docs#quote
export async function fetchStockQuote(ticker: string) {
  const res = await fetch("https://api.twelvedata.com/quote?apikey=" + process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY + "&symbol=" + ticker);
  const data = await res.json();
  return data;
}

// https://twelvedata.com/docs#profile
export async function fetchStockProfile(ticker: string) {
  const res = await fetch("https://api.twelvedata.com/profile?apikey=" + process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY + "&symbol=" + ticker);
  const data = await res.json();
  return data;
}

// Getting the price at 5 min intervals starting at 9:30 for trading days
export async function fetchStockDaily5Min(ticker: string) {
  var d = new Date().getDay();
  var m = new Date().getMonth() + 1;
  var y = new Date().getFullYear().toString();
  if (m < 10) {
    var mStr: string = "0" + m;
  } else {
    var mStr: string = m.toString();
  }
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=" +
      process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY +
      "&interval=5min&timezone=exchange&start_date=" +
      y +
      "-" +
      mStr +
      "-" +
      d +
      "09:30:00&format=JSON&symbol=" +
      ticker,
  );
  const data = await res.json();
  return data;
}

export async function fetchSPX() {
  //Getting the current month and year to then pass to the GET request below
  var m = new Date().getMonth() + 1;
  var y = new Date().getFullYear().toString();
  //For adding a "0" to the start of the month number if it's a single digit number
  if (m < 10) {
    var mStr: string = "0" + m;
  } else {
    var mStr: string = m.toString();
  }
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=" +
      process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY +
      "&interval=1month&symbol=SPX&format=JSON&end_date=" +
      y +
      "-" +
      mStr +
      "-01 15:10:00&dp=2&outputsize=12",
  ); //Returns JSON data for S&P500 for the last 12 months
  const data = await res.json();
  return data;
}

//Fetching a stocks price for the last 12 months
export async function fetchStockMonthly(ticker: string) {
  var m = new Date().getMonth() + 1;
  var y = new Date().getFullYear().toString();
  if (m < 10) {
    var mStr: string = "0" + m;
  } else {
    var mStr: string = m.toString();
  }
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=" +
      process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY +
      "&interval=1month&symbol=" +
      ticker +
      "&format=JSON&end_date=" +
      y +
      "-" +
      mStr +
      "-01 15:10:00&dp=2&outputsize=12",
  ); //Returns JSON data for S&P500 for the last 12 months
  const data = await res.json();
  return data;
}
