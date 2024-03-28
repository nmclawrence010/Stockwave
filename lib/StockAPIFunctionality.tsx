export async function fetchStockData(ticker: string) {
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=adc7d6ddaadc405683b7a833edd5abbc&interval=1min&symbol=" +
      ticker +
      "&dp=2&" +
      "format=JSON&outputsize=12",
  );
  const data = await res.json(); //Returns the whole json from TwelveData
  //const finalPrice = data.values[0].close; //Returns just the last price of the stock
  //console.log("VALUES", data.values[0].datetime);
  console.log("STOCK", data.meta);
  // console.log("VALUES", data.values[0]);
  return data;
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
  //Gets the current month and year to then pass to the GET request below
  var m = new Date().getMonth() + 1;
  const y = new Date().getFullYear().toString();
  //For adding a "0" to the start of the month number if it's a single digit number
  if (m < 10) {
    var mStr: string = "0" + m;
  } else {
    var mStr: string = m.toString();
  }
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=adc7d6ddaadc405683b7a833edd5abbc&interval=1month&symbol=SPX&format=JSON&end_date=" +
      y +
      "-" +
      mStr +
      "-01 15:10:00&dp=2&outputsize=12",
  ); //Returns JSON data for S&P500 for the last 12 months
  const data = await res.json();
  //console.log(data);
  return data;
}
