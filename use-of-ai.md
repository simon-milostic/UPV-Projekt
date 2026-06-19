# Python code:

## Original code:

`def api_get(sufiks, parametri):`<br>
    `url = VIR_PODATKOV + "/" + sufiks + "?" + parametri`<br>
    `odgovor = requests.get(url)`<br>
    `odgovor.raise_for_status()`<br>
    `with open(odgovor) as f:`<br>
        `return json.load(f)`<br>
        
"im trying to make a function that calls an api with a suffix and parameters but it's not working. <br>
the url doesn't build right if I+i pass parameters as a dict, and t also cant parse the response at the end. i need help"<br>

## Answer:
"The issue is two things — you need `urlencode()` to properly convert a dict into URL query parameters, and API responses aren't files, so `json.load()` won't work. <br>
Use `.json()` directly on the response object instead. Also worth adding a timeout so the request doesn't hang:<br>

`def api_get(sufiks, parametri):`<br>
    `url = f"{VIR_PODATKOV}/{sufiks}?{urlencode(parametri)}"`<br>
    `odgovor = requests.get(url, timeout=12)`<br>
    `odgovor.raise_for_status()`<br>
    `return odgovor.json()`<br>


## Original code:

`podatki = api_get(`<br>
    `f"coins/{coin}/market_chart",`<br>
    `{"vs_currency": valuta, "days": obdobje},`<br>
`)`<br>
`cache[kljuc] = {"fetched_at": zdaj, "data": podatki}`<br>
`zapisi_cache(cache)`<br>
`return podatki, "live", None`<br>

my code only works if internet and the api are reachable, but if theres any error with the request the whole program crashes. <br>
how do i make it so the program doesnt crash but instead returns old data from the cache if available<br>

## Answer:
"You need try/except here — it lets you attempt something and gracefully handle it if it fails instead of crashing. Wrap your API call in a try block, and in the except catch <br> `requests.RequestException` specifically (covers all network/HTTP errors). <br>
Inside the except, check if stale cache data exists and return that as a fallback:"<br>

  `try:`<br>
        `podatki = api_get(`<br>
            `f"coins/{coin}/market_chart",`<br>
            `{"vs_currency": valuta, "days": obdobje},`<br>
        `)`<br>
        `cache[kljuc] = {"fetched_at": zdaj, "data": podatki}`<br>
        `zapisi_cache(cache)`<br>
        `return podatki, "live", None`<br>
  `except requests.RequestException as napaka:`<br>
        `if shranjeno is not None:`<br>
            `return shranjeno["data"], "cache", str(napaka)`<br>


## Question:
"i have a timestamp in milliseconds from the api, how do I convert it into a readable date? <br>
like '14:30' if im looking at the last day, or 'May 15' if I'm looking at a longer period?"<br>

## Answer:
"You can use Python's built-in datetime module for this. First divide the `timestamp` by 1000 (since Python expects seconds, not milliseconds), then use `fromtimestamp()` to convert it to a datetime object. <br>
From there, `strftime()` lets you format it however you want — `%H:%M` for hours and minutes, `%b %d` for the short month name and day:<br>"

`def formatiraj_datum(timestamp, obdobje):`<br>
    `datum = datetime.fromtimestamp(timestamp / 1000)`<br>
    `if obdobje == "1":`<br>
        `return datum.strftime("%H:%M")`<br>
    `return datum.strftime("%b %d")`<br>


## Original code:

`def pripravi_graf(tocke, obdobje, valuta, metrika, sirina=900, visina=340):`<br>
    `rob = {"levo": 74, "desno": 24, "zgoraj": 28, "spodaj": 48}`<br>
    `if not tocke:`<br>
        `return {`<br>
            `"sirina": sirina,`<br>
            `"visina": visina,`<br>
            `"tocke": [],`<br>
            `"crta": "",`<br>
            `"ploskev": "",`<br>
            `"y_oznake": [],`<br>
            `"x_oznake": [],`<br>
        `}`<br>
    `vrednosti = [tocka[1] for tocka in tocke]`<br>
    `najmanjsa = min(vrednosti)`<br>
    `najvecja = max(vrednosti)`<br>
    `razpon = najvecja - najmanjsa`<br>
    `sirina_grafa = sirina - rob["levo"] - rob["desno"]`<br>
    `visina_grafa = visina - rob["zgoraj"] - rob["spodaj"]`<br>
    `korak_x = sirina_grafa / len(tocke)`<br>
    `narisane = []`<br>
    `for indeks, (timestamp, vrednost) in enumerate(tocke):`<br>
        `x = rob["levo"] + indeks * korak_x`<br>
        `y = visina_grafa - (vrednost - najmanjsa) / razpon * visina_grafa`<br>
        `narisane.append({`<br>
            `"x": round(x, 2),`<br>
            `"y": round(y, 2),`<br>
            `"vrednost": formatiraj_stevilo(vrednost, valuta),`<br>
            `"datum": formatiraj_datum(timestamp, obdobje),`<br>
        `})`<br>
  `crta = ""`<br>
  `for tocka in narisane:`<br>
      `crta += str(tocka["x"]) + " " + str(tocka["y"]) + " "`<br>

  `ploskev = crta`<br>
    `return {`<br>
        `"sirina": sirina,`<br>
        `"visina": visina,`<br>
        `"tocke": narisane,`<br>
        `"crta": crta,`<br>
        `"ploskev": ploskev,`<br>
        `"y_oznake": [],`<br>
        `"x_oznake": [],`<br>
    `}`<br>
    
"im making a graph without matplotlib, i have the base, but i have two problems. first is that y coordinates dont calculate right,<br>
the graph is sometimes flipped or points fall outside the area. <br>
second is i dont know how to add padding top and bottom so the graph isnt right at the edge. can you help me just with that part<br>"

## Answer:

"Two things — for the flipped y axis, remember that in SVG y=0 is at the top, so you need to subtract from the top margin, not the bottom. 
For padding, add a small percentage of the range above and below your min/max before calculating positions:"

`razpon = najvecja - najmanjsa or max(abs(najvecja), 1)`<br>
`spodnja = najmanjsa - razpon * 0.08`<br>
`zgornja = najvecja + razpon * 0.08`<br>
`razpon = zgornja - spodnja if zgornja != spodnja else 1`<br>

"And for the y coordinate of each point:"<br>

`y = rob["zgoraj"] + (zgornja - vrednost) / razpon * visina_grafa` <br>

"Also fix `korak_x` — you want to divide by `len(tocke) - 1` so the last point lands exactly at the right edge:"<br>

`korak_x = sirina_grafa / max(len(tocke) - 1, 1)`<br>


## Question:
"ok coordinates are fine now, but I dont know how to make the line and filled area under the graph <br>
i know graph has polyline and polygon but i dont know how to format the points string attribute i tried a bit but it doesn't work<br>"

## Answer:
"SVG polyline and polygon both take a points attribute where each coordinate is written as x,y and pairs are separated by spaces. So for the line you just join all your points:"<br>

`crta = " ".join(f"{tocka['x']},{tocka['y']}" for tocka in narisane)`<br>

"For the filled area (ploskev) you need a closed polygon — same points as the line, but you add two extra corners at the bottom left and bottom right to close the shape underneath:"<br>

`ploskev = (`<br>
    `f"{rob['levo']},{visina - rob['spodaj']} "`<br>
    `+ crta`<br>
    `+ f" {sirina - rob['desno']},{visina - rob['spodaj']}"`<br>
`)`<br>

"The two added points bring the polygon down to the bottom of the graph area so the fill closes properly under the line."


## Original code:
`x_oznake = []`<br>
`for timestamp, vrednost in tocke[::len(tocke)//6]:`<br>
    `x = tocke.index((timestamp, vrednost)) * korak_x`<br>
    `x_oznake.append({"x": round(x, 2), "vrednost": formatiraj_datum(timestamp, obdobje)})`<br>
    
"im trying to make x labels on the graph and i want to show 6 evenly spaced dates on the x axis. <br>
my way doesnt work because index() is slow and sometimes returns the wrong result if there are duplicate values, also slicing isn't really even. how do I do this more reliably???"<br>

## Answer:
"The problem is you're trying to find the position of a point after the fact with `index()` — instead, keep track of the original index from the start. <br>
That's what `izbor_tock()` does, it returns `(indeks, tocka)` pairs of evenly spaced points with their original positions. <br>
Then you use that index directly to calculate x, so it's always <br>
accurate:"<br>

`x_oznake = []`<br>
`for _, (indeks, (timestamp, _)) in enumerate(izbor_tock(tocke, 6)):`<br>
    `x = rob["levo"] + indeks * korak_x`<br>
    `x_oznake.append({"x": round(x, 2), "vrednost": formatiraj_datum(timestamp, obdobje)})`<br>

"The `_` in the outer enumerate just discards the counter since you don't need it — the real index you care about is indeks coming from `izbor_tock.`"<br>


# HTML:

## Original:

`<form action="/crypto/" method="get" class="filters">`<br>
    `<label>`<br>
        `Coin`<br>
        `<select name="coin">`<br>
            `<option value="bitcoin">Bitcoin</option>`<br>
            `<option value="ethereum">Ethereum</option>`<br>
            `<option value="solana">Solana</option>`<br>
        `</select>`<br>
    `</label>`<br>
    
"i have hardcoded options in the select but i want them to be generated dynamically from a python dict i made how do i make a loop in a bottle template<br>
and how do i mark the currently selected option"<br>

## Answer:

"In Bottle's templating engine you use % for to loop and % end to close it — it's similar to Python but embedded in HTML. <br>
To mark the currently selected option, use an inline if inside the selected attribute:"<br>

`<form action="/crypto/" method="get" class="filters">`<br>
    `<label>`<br>
        `Coin`<br>
        `<select name="coin">`<br>
            `% for key, label in dashboard["moznosti"]["kriptovalute"].items():`<br>
            `<option value="{{key}}" {{'selected' if key == dashboard["coin"] else ''}}>{{label}}</option>`<br>
            `% end`<br>
        `</select>`<br>
    `</label>`<br>
    
"`{{key}}` and `{{label}}` are Bottle's way of printing variables into HTML, and `%` `for ...` `% end` wraps the loop. <br>
The selected attribute just needs to be present on the right option — the inline if handles that by printing 'selected' or an empty string."<br>


## Original:

`<svg class="chart" viewBox="0 0 900 340" role="img">`<br>
    `<line x1="74" y1="0" x2="74" y2="340" class="axis"></line>`<br>
    `<line x1="74" y1="340" x2="900" y2="340" class="axis"></line>`<br>
    `<polyline points="100,200 200,150 300,180" class="line"></polyline>`<br>
    `% for tocka in dashboard["graf"]["tocke"]:`<br>
    `<circle cx="{{tocka['x']}}" cy="{{tocka['y']}}" r="3" class="point"></circle>`<br>
    `% end`<br>
`</svg>`<br>

"i have a basic svg graph but im missing a lot of things such as grid lines, y and x labels, filled area under the graph, and tooltips on the points. <br>
how do I add all this dynamically from python data?"<br>

## Answer:

"You already have all the data you need from `pripravi_graf()`, just need to wire it up in the template. A few things to add — loop over `y_oznake` for grid lines and labels,<br>
loop over `x_oznake` for the bottom labels, use `ploskev` for the filled polygon and crta for the polyline, and make the viewBox dynamic. <br>
For tooltips, SVG has a built-in `<title>` tag you can nest inside any element:"<br>

`<svg class="chart" viewBox="0 0 {{dashboard['graf']['sirina']}} {{dashboard['graf']['visina']}}" role="img" aria-label="Crypto value chart">`<br>
    `% for oznaka in dashboard["graf"]["y_oznake"]:`<br>
    `<line x1="74" y1="{{oznaka['y']}}" x2="876" y2="{{oznaka['y']}}" class="grid"></line>`<br>
    `<text x="62" y="{{oznaka['y'] + 4}}" class="axis-label" text-anchor="end">{{oznaka["vrednost"]}}</text>`<br>
    `% end`<br>
    `% for oznaka in dashboard["graf"]["x_oznake"]:`<br>
    `<text x="{{oznaka['x']}}" y="326" class="axis-label" text-anchor="middle">{{oznaka["vrednost"]}}</text>`<br>
    `% end`<br>
    `<line x1="74" y1="292" x2="876" y2="292" class="axis"></line>`<br>
    `<line x1="74" y1="28" x2="74" y2="292" class="axis"></line>`<br>
    `<polygon points="{{dashboard['graf']['ploskev']}}" class="area"></polygon>`<br>
    `<polyline points="{{dashboard['graf']['crta']}}" class="line"></polyline>`<br>
    `% for tocka in dashboard["graf"]["tocke"]:`<br>
    `<circle cx="{{tocka['x']}}" cy="{{tocka['y']}}" r="3" class="point">`<br>
        `<title>{{tocka["datum"]}}: {{tocka["vrednost"]}}</title>`<br>
    `</circle>`<br>
    `% end`<br>
`</svg>`<br>

"The `<title>` inside each `<circle>` gives you a native SVG tooltip on hover — no JavaScript needed."<br>


# CSS:

## Original:

`select {`<br>
    `height: 40px;`<br>
    `padding: 0 10px;`<br>
    `border: 1px solid #b6c2bd;`<br>
    `border-radius: 6px;`<br>
    `background: #ffffff;`<br>
    `color: #18201d;`<br>
    `font-size: 0.95rem;`<br>
`}`<br>

"my select looks ok but the arrow the browser adds is ugly and doesnt fit the design. id like to make a custom arrow in my color.<br>
also, the font isnt applying right. how do i do this with just CSS???"<br>

## Answer:
"First hide the default browser arrow with appearance: `none` (and -webkit-appearance for Safari), then draw your own using two linear-gradient triangles positioned in the background. <br>
You also need to explicitly set `font-family` and `font-weight` on selects because they don't inherit these automatically in most browsers:"<br>

`select {`<br>
    `min-width: 142px;`<br>
    `height: 40px;`<br>
    `padding: 0 10px;`<br>
    `border: 1px solid #b6c2bd;`<br>
    `border-radius: 6px;`<br>
    `background: #ffffff;`<br>
    `color: #18201d;`<br>
    `font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;`<br>
    `font-weight: 800;`<br>
    `font-size: 0.95rem;`<br>
    `-webkit-appearance: none;`<br>
    `appearance: none;`<br>
    `padding-right: 40px;`<br>
    `background-image: linear-gradient(45deg, transparent 50%, #244c3c 50%), linear-gradient(135deg, #244c3c 50%, transparent 50%);`<br>
    `background-position: calc(100% - 18px) calc(50% - 2px), calc(100% - 13px) calc(50% - 2px);`<br>
    `background-size: 6px 6px, 6px 6px;`<br>
    `background-repeat: no-repeat;`<br>
`}`<br>

"The two gradients together form a small chevron — the first draws the left half, the second the right half. `background-position` places them side by side at the right edge, <br>
and `padding-right: 40px` makes sure the selected text never overlaps the arrow."<br>

## Comment

Everything after line 153 in style.css is made with big help of AI, however, the main goal of this project was not the design od the page. The project and the code itself would <br>
work just fine even without the AI generated part, it was generated with the sole purpose to make the site more visually appealing, CSS is a "decorative" file after all, <br>
and does not hold any structure itself. Same goes with script.js, it is there only to make experience smoother and more enjoyable to the viewer.<br>
<br>
Moreover, AI assistance was used only when the code reached certain complexity, as it can be seen from this file. <br>
Most of the background knowledge was gained using different internet sources, YouTube tutorials and analysing past codes.<br>
