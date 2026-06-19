import json
import time
import requests
from datetime import datetime
from pathlib import Path
from urllib.parse import urlencode

# Creating file paths, Path module makes the formatting easier to handle
ROOT = Path(__file__).resolve().parent
DATOTEKA_CRYPTO = ROOT / "data" / "crypto.json"

# This is the source we'll be using
VIR_PODATKOV = "https://api.coingecko.com/api/v3"

# Simple dictionaries to convert values (and other variables) to more readable formats
KRIPTOVALUTE = {
    "bitcoin": "Bitcoin",
    "ethereum": "Ethereum",
    "solana": "Solana",
    "cardano": "Cardano",
    "dogecoin": "Dogecoin",
}

VALUTE = {
    "usd": "USD",
    "eur": "EUR",
}

OBDOBJA = {
    "1": "24 hours",
    "7": "7 days",
    "30": "30 days",
    "90": "90 days",
    "365": "1 year",
}

METRIKE = {
    "price": "Price",
    "market_cap": "Market cap",
    "volume": "Volume",
}

POLJA_METRIK = {
    "price": "prices",
    "market_cap": "market_caps",
    "volume": "total_volumes",
}

BARVE = ["#2f7d5c", "#b65f2a", "#315f9f", "#8b4fb5", "#a43844"]

# This is another way to say cache time is 15 minutes, obviously seconds will be an easier variable
CACHE_SECONDS = 15 * 60


def izbira(vrednost, dovoljene, privzeto):
    return vrednost if vrednost in dovoljene else privzeto

# Self explanatory, reads from DATOTEKA_CRYPTO (or crypto.json) if it exists and is nonempty
def preberi_cache():
    if not DATOTEKA_CRYPTO.exists() or DATOTEKA_CRYPTO.stat().st_size == 0:
        return {}
    with open(DATOTEKA_CRYPTO, "r", encoding="utf-8") as datoteka:
        return json.load(datoteka)

# Writes the data in the cache.json
def zapisi_cache(podatki):
    with open(DATOTEKA_CRYPTO, "w", encoding="utf-8") as datoteka:
        json.dump(podatki, datoteka, ensure_ascii=False, indent=2)

def cache_kljuc(coin, valuta, obdobje):
    return f"{coin}:{valuta}:{obdobje}"

# Builds a link and then returns data in the form of a python dictionary
def api_get(sufiks, parametri):
    url = f"{VIR_PODATKOV}/{sufiks}?{urlencode(parametri)}"
    odgovor = requests.get(url, timeout=12)
    odgovor.raise_for_status()
    # This is not a file so we cannot use json.load, instead, we use .json()
    return odgovor.json()


def pridobi_trzne_podatke(coin, valuta, obdobje, force_refresh=False):
    cache = preberi_cache()
    kljuc = cache_kljuc(coin, valuta, obdobje)
    shranjeno = cache.get(kljuc)
    zdaj = time.time()

    # Here we check if we get any data from the cache with the wanted key and if the data in the cache is not outdated
    if (
        not force_refresh
        and shranjeno is not None
        and zdaj - shranjeno.get("fetched_at", 0) < CACHE_SECONDS
    ):
        return shranjeno["data"], "cache", None

    # If that fails, we try the following:
    try:
        # Get the data from the live source
        podatki = api_get(
            f"coins/{coin}/market_chart",
            {"vs_currency": valuta, "days": obdobje},
        )
        
        cache[kljuc] = {"fetched_at": zdaj, "data": podatki}
        # Update the cache with this data
        zapisi_cache(cache)
        return podatki, "live", None
    except requests.RequestException as napaka:
        # Check if the data is in the cache, but rendered old
        if shranjeno is not None:
            return shranjeno["data"], "cache", str(napaka)


def formatiraj_stevilo(vrednost, valuta=None):
    if vrednost is None:
        return "n/a"

    # Gets the currency symbol from the dictionary and if it doesn't exist, it returns valuta.upper()
    oznaka = VALUTE.get(valuta, valuta.upper()) if valuta else ""
    if abs(vrednost) >= 1_000_000_000:
        prikaz = f"{vrednost / 1_000_000_000:.2f}B"
    elif abs(vrednost) >= 1_000_000:
        prikaz = f"{vrednost / 1_000_000:.2f}M"
    elif abs(vrednost) >= 1_000:
        prikaz = f"{vrednost:,.2f}"
    else:
        prikaz = f"{vrednost:.4f}".rstrip("0").rstrip(".") # Represents small numbers

    return f"{prikaz} {oznaka}" if oznaka else prikaz

# Formats the timestamp number into a readable date
def formatiraj_datum(timestamp, obdobje):
    datum = datetime.fromtimestamp(timestamp / 1000)
    if obdobje == "1":
        return datum.strftime("%H:%M")
    return datum.strftime("%b %d")


def sprememba_v_odstotkih(tocke):
    if len(tocke) < 2 or tocke[0][1] == 0: # We don't want to divide by zero, nor do we want for a list "tocke" to be less than lenght 2
        return 0 # If it wasn't obvious, list "tocke" is located in cache.json it each element is formatted as: [timestamp, value]
    return ((tocke[-1][1] - tocke[0][1]) / tocke[0][1]) * 100 # Change (in %) from the first to the final point


def izbor_tock(tocke, koliko):
    if len(tocke) <= koliko: # If there's less data points than we want, return all of them
        return list(enumerate(tocke))
    korak = (len(tocke) - 1) / (koliko - 1) # Otherwise, we want every i-th point, this is what korak does
    indeksi = sorted({round(i * korak) for i in range(koliko)}) # This generates a set of some starting point and it's multiple by korak
    return [(indeks, tocke[indeks]) for indeks in indeksi] # Returns a list as following: [(0, tocke[0] = [timestamp, value]), (1, ...)]


def pripravi_graf(tocke, obdobje, valuta, metrika, sirina=900, visina=340):
    rob = {"levo": 74, "desno": 24, "zgoraj": 28, "spodaj": 48} # Graph margins
    if not tocke:
        return {
            "sirina": sirina,
            "visina": visina,
            "tocke": [],
            "crta": "",
            "ploskev": "",
            "y_oznake": [],
            "x_oznake": [],
        } # Returns an empty graph if there are no data points

    vrednosti = [tocka[1] for tocka in tocke] # A list of all values in the list "tocke"
    najmanjsa = min(vrednosti)
    najvecja = max(vrednosti)
    razpon = najvecja - najmanjsa or max(abs(najvecja), 1)
    spodnja = najmanjsa - razpon * 0.08 # Padding of 8% lower
    zgornja = najvecja + razpon * 0.08 # Padding of 8% higher
    razpon = zgornja - spodnja if zgornja != spodnja else 1 # Range with padding

    sirina_grafa = sirina - rob["levo"] - rob["desno"] # Remove the margins from the width
    visina_grafa = visina - rob["zgoraj"] - rob["spodaj"] # Remove the margins from the height
    korak_x = sirina_grafa / max(len(tocke) - 1, 1) # Distance between each point w.r.t the x-axis

    narisane = []
    for indeks, (timestamp, vrednost) in enumerate(tocke): # enumerate(tocke) gives us a tuple (0, tocka) and so on
        x = rob["levo"] + indeks * korak_x # Start at the left margin and each next point is moved by korak_x
        y = rob["zgoraj"] + (zgornja - vrednost) / razpon * visina_grafa # "(zgornja - vrednost) / razpon" gives the relative position of the point (y-axis) we multiply to make it absolute and add the top margin
        # This is a list of directories, each directory gives us a geometric point with its values and dates
        narisane.append(
            {
                "x": round(x, 2),
                "y": round(y, 2),
                "vrednost": formatiraj_stevilo(vrednost, valuta if metrika != "volume" else None),
                "datum": formatiraj_datum(timestamp, obdobje),
            }
        )

    crta = " ".join(f"{tocka['x']},{tocka['y']}" for tocka in narisane)
    ploskev = (
        f"{rob['levo']},{visina - rob['spodaj']} "
        + crta
        + f" {sirina - rob['desno']},{visina - rob['spodaj']}"
    )

    y_oznake = []
    for i in range(5):
        vrednost = spodnja + (razpon / 4) * i
        y = rob["zgoraj"] + (zgornja - vrednost) / razpon * visina_grafa
        y_oznake.append(
            {
                "y": round(y, 2),
                "vrednost": formatiraj_stevilo(vrednost, valuta if metrika != "volume" else None),
            }
        )

    x_oznake = []
    for _, (indeks, (timestamp, _)) in enumerate(izbor_tock(tocke, 6)):
        x = rob["levo"] + indeks * korak_x
        x_oznake.append({"x": round(x, 2), "vrednost": formatiraj_datum(timestamp, obdobje)})

    return {
        "sirina": sirina,
        "visina": visina,
        "tocke": narisane,
        "crta": crta,
        "ploskev": ploskev,
        "y_oznake": y_oznake,
        "x_oznake": x_oznake,
        "rob": rob,
        "najmanjsa": formatiraj_stevilo(najmanjsa, valuta if metrika != "volume" else None),
        "najvecja": formatiraj_stevilo(najvecja, valuta if metrika != "volume" else None),
        "povprecje": formatiraj_stevilo(sum(vrednosti) / len(vrednosti), valuta if metrika != "volume" else None),
    }


# Only for compact reasons, we'll be seeing the function later on
def moznosti():
    return {
        "kriptovalute": KRIPTOVALUTE,
        "valute": VALUTE,
        "obdobja": OBDOBJA,
        "metrike": METRIKE,
    }


def pripravi_vrednosti(coin, valuta, obdobje, metrika, force_refresh=False):
    # We've met these functions before, for refreshment, variable = variable unless coin isn't in VAR_DIRECTORY, then we take default variable
    coin = izbira(coin, KRIPTOVALUTE, "bitcoin")
    valuta = izbira(valuta, VALUTE, "usd")
    obdobje = izbira(obdobje, OBDOBJA, "30")
    metrika = izbira(metrika, METRIKE, "price")

    podatki, vir, napaka = pridobi_trzne_podatke(coin, valuta, obdobje, force_refresh) # We have met this function, it returns a 3-tuple it is recommended to see what the original function returns and to check out cache.json for more info on what data really is
    polje = POLJA_METRIK[metrika] # We choose what metric to analyse. Tip: Hover over the directory to see its content, we can choose between price, market cap and volume
    tocke = podatki.get(polje, []) # Tocke is what we will graph later on, obviously what we graph depends on what "polje" is
    
    '''
     We may notice tocke is only defined now, but was called in pripravi_graf function which is defined before this. This isn't circular as only this function calls pripravi_graf and pripravi_graf only stores tocke as some variable.
     If we were to somehow call this function in pripravi_graf function, then we would have a problem.
    '''
    
    trenutna_vrednost = tocke[-1][1] if tocke else None
    sprememba = sprememba_v_odstotkih(tocke)

    return {
        "coin": coin,
        "valuta": valuta,
        "obdobje": obdobje,
        "metrika": metrika,
        "ime": KRIPTOVALUTE[coin],
        "oznaka_valute": VALUTE[valuta],
        "oznaka_obdobja": OBDOBJA[obdobje],
        "oznaka_metrike": METRIKE[metrika],
        "vrednost": formatiraj_stevilo(trenutna_vrednost, valuta if metrika != "volume" else None),
        "sprememba": sprememba,
        "sprememba_prikaz": f"{sprememba:+.2f}%",
        "graf": pripravi_graf(tocke, obdobje, valuta, metrika),
        "vir": vir,
        "napaka": napaka,
        "moznosti": moznosti(),
    }


def pripravi_pregled(valuta="usd"):
    valuta = izbira(valuta, VALUTE, "usd")
    kartice = []
    for coin in list(KRIPTOVALUTE)[:4]:
        vrednosti = pripravi_vrednosti(coin, valuta, "7", "price")
        kartice.append(vrednosti)
    return {"valuta": valuta, "oznaka_valute": VALUTE[valuta], "kartice": kartice, "moznosti": moznosti()}

