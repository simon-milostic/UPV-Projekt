# Crypto market dashboard
## Description

The goal of this project is to fetch data from the CoinGecko public API and represent it in a visual manner — a graph.<br>
The user will notice the ability to choose between several cryptocurrencies as well as their price, date, and metric.<br>


## External help

Use of AI is present within this program and, if the viewer is interested, more details are available in the public repository under:<br>
- `use-of-ai.md`.<br>


## Code sturcture
- `main.py` defines routes and user interaction across several pages
  <br>
- `model.py` fetches, caches, and prepares market data.<br>
- `views/` contains Bottle templates.<br>
- `style/` contains CSS and JS.<br>
- `data/crypto.json` stores cached finance data.<br>


## How to run

- `python3 main.py` in terminal should do the trick, if not, the following ought to work:<br>

- `python3 -m venv venv`<br>
Followed by: <br>
- `source venv/bin/activate`<br>
And then: <br>
- `pip install -r requirements.txt`<br>

Now that we have everything set up and imported, we can run the program:<br>
- `python main.py`<br>

Then open <http://localhost:8080/>.<br>


## How to update the code

Simply go to the desired file, change it and use Cmd+S, reload the page afterwards.<br>


## How to close

If Ctrl+C doesn't work do the following in the terminal:<br>
`lsof -i :8080`<br>
`kill [number]`<br>
The number you need to input is next to your username.<br>

## Available pages:

- `/` market overview
- `/crypto/` detailed single-asset dashboard
- `/about/` data notes
