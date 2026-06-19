% rebase('base.tpl', aktivna_stran=aktivna_stran)

<main class="page narrow">
    <section class="toolbar simple">
        <div>
            <p class="cool">Data</p>
            <h1>About this page</h1>
        </div>
    </section>

    <section class="text-panel">
        <h2>Current data source</h2>
        <p>The app is pulling crypto market history from CoinGecko's public market chart endpoint using Python requests. Results are cached in <code>data/crypto.json</code> for 15 minutes.</p>

        <h2>Features</h2>
        <p>As of right now, the viewer is able to see the trend of certain cryptos as well as the time frame and different metrics.</p>

        <h2>Next variables to add</h2>
        <p>If this were to ever expand, the next filters to be added would be moving average, volatility, exchange/source and most notably comparison of different cryptos w.r.t different metrics.</p>
    </section>
</main>
