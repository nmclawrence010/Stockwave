export async function fetchStockData(ticker: string) {
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=adc7d6ddaadc405683b7a833edd5abbc&interval=1min&symbol=" +
      ticker +
      "&dp=2&" +
      "start_date=2024-01-18 14:07:00&format=JSON&outputsize=1",
  );
  const data = await res.json(); //Returns the whole json from TwelveData
  const finalPrice = data.values[0].close; //Returns just the last price of the stock
  console.log(data.meta.symbol);
  //console.log("VALUES", data.values[0].datetime);
  // console.log("META", data.meta);
  // console.log("VALUES", data.values[0]);
  return finalPrice;
}

export async function fetchLogo(ticker: string) {
  const res = await fetch(
    "https://api.twelvedata.com/logo?symbol=" +
      ticker +
      "&apikey=adc7d6ddaadc405683b7a833edd5abbc",
  );
  const logoLink = await res.json(); //Returns the whole json from TwelveData
  const logoURL = logoLink.url; //Returns just the URL link to the company logo
  //console.log("APICALL-LOGO:", logoURL);
  return logoURL;
}

export async function fetchSPX() {
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=adc7d6ddaadc405683b7a833edd5abbc&interval=1month&symbol=SPX&dp=2",
  ); //Returns JSON data for S&P500 for the last 12 months
  const data = await res.json();
  return data;
}
