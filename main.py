print(">>> MAIN.PY STARTED <<<")
import bottle

import model_p # We import our functions. As they share the same directory we need not to specify anything further


app = bottle.Bottle()

# The first page when running the program. As seen, it has no sufix other than "/"
@app.get("/")
def index():
    pregled = model_p.pripravi_pregled(bottle.request.query.get("currency", "usd")) # Query is the part of the link after "?", if the link is empty (only localhost) default currency will be USD
    return bottle.template("views/index.tpl", pregled=pregled, aktivna_stran="overview")


@app.get("/crypto/")
def crypto():
    dashboard = model_p.pripravi_vrednosti(
        bottle.request.query.get("coin", "bitcoin"),
        bottle.request.query.get("currency", "usd"),
        bottle.request.query.get("days", "30"),
        bottle.request.query.get("metric", "price"),
        bottle.request.query.get("refresh") == "1",
    )
    return bottle.template("views/crypto.tpl", dashboard=dashboard, aktivna_stran="crypto")

@app.get("/about/")
def about():
    return bottle.template("views/about.tpl", aktivna_stran="about")


@app.get("/style/<datoteka>")
def style(datoteka):
    return bottle.static_file(datoteka, root="style")


if __name__ == "__main__":
    bottle.run(app, host="localhost", port=8080, debug=True)
