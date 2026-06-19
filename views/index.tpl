% rebase('base.tpl', aktivna_stran=aktivna_stran)

<main class="page">
    <section class="toolbar">
        <div>
            <p class="cool">Overview</p>
            <h1>Crypto market dashboard</h1>
        </div>

        <form action="/" method="get" class="filters compact">
            <label>
                Currency
                <select name="currency">
                    % for key, label in pregled["moznosti"]["valute"].items():
                    <option value="{{key}}" {{'selected' if key == pregled["valuta"] else ''}}>{{label}}</option>
                    % end
                </select>
            </label>
            <button type="submit">Update</button>
        </form>
    </section>

    <section class="market-grid">
        % for kartica in pregled["kartice"]:
        <a class="market-card" href="/crypto/?coin={{kartica['coin']}}&currency={{pregled['valuta']}}&days=30&metric=price">
            <span>{{kartica["ime"]}}</span>
            <strong>{{kartica["vrednost"]}}</strong>
            <em class="{{'positive' if kartica["sprememba"] >= 0 else 'negative'}}">{{kartica["sprememba_prikaz"]}} over 7 days</em>
        </a>
        % end
    </section>

    <section class="split-section single">
        <article>
            <h2>Detailed asset view</h2>
            <p>Choose one coin, a currency, period, and metric. The chart includes axes, gridlines, labels as well as high, low and average data. </p>
            <a class="text-link" href="/crypto/">Open crypto page</a>
        </article>
    </section>
</main>
