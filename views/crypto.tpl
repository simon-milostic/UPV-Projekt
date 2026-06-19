% rebase('base.tpl', aktivna_stran=aktivna_stran)

<main class="page">
    <section class="toolbar">
        <div>
            <p class="cool">Asset detail</p>
            <h1>Crypto dashboard</h1>
        </div>

        <form action="/crypto/" method="get" class="filters">
            <label>
                Coin
                <select name="coin">
                    % for key, label in dashboard["moznosti"]["kriptovalute"].items():
                    <option value="{{key}}" {{'selected' if key == dashboard["coin"] else ''}}>{{label}}</option>
                    % end
                </select>
            </label>

            <label>
                Currency
                <select name="currency">
                    % for key, label in dashboard["moznosti"]["valute"].items():
                    <option value="{{key}}" {{'selected' if key == dashboard["valuta"] else ''}}>{{label}}</option>
                    % end
                </select>
            </label>

            <label>
                Period
                <select name="days">
                    % for key, label in dashboard["moznosti"]["obdobja"].items():
                    <option value="{{key}}" {{'selected' if key == dashboard["obdobje"] else ''}}>{{label}}</option>
                    % end
                </select>
            </label>

            <label>
                Metric
                <select name="metric">
                    % for key, label in dashboard["moznosti"]["metrike"].items():
                    <option value="{{key}}" {{'selected' if key == dashboard["metrika"] else ''}}>{{label}}</option>
                    % end
                </select>
            </label>

            <button type="submit">Update</button>
            <button type="submit" name="refresh" value="1" class="secondary">Refresh data</button>
        </form>
    </section>

    <section class="summary">
        <article>
            <span>Asset</span>
            <strong>{{dashboard["ime"]}}</strong>
        </article>
        <article>
            <span>{{dashboard["oznaka_metrike"]}}</span>
            <strong>{{dashboard["vrednost"]}}</strong>
        </article>
        <article>
            <span>Change</span>
            <strong class="{{'positive' if dashboard["sprememba"] >= 0 else 'negative'}}">{{dashboard["sprememba_prikaz"]}}</strong>
        </article>
        <article>
            <span>Data</span>
            <strong>{{dashboard["vir"]}}</strong>
        </article>
    </section>

    <section class="chart-panel">
        <div class="chart-heading">
            <h2>{{dashboard["oznaka_metrike"]}} over {{dashboard["oznaka_obdobja"]}}</h2>
            <p>{{dashboard["ime"]}} / {{dashboard["oznaka_valute"]}}</p>
        </div>

        <svg class="chart" viewBox="0 0 {{dashboard['graf']['sirina']}} {{dashboard['graf']['visina']}}" role="img" aria-label="Crypto value chart">
            % for oznaka in dashboard["graf"]["y_oznake"]:
            <line x1="74" y1="{{oznaka['y']}}" x2="876" y2="{{oznaka['y']}}" class="grid"></line>
            <text x="62" y="{{oznaka['y'] + 4}}" class="axis-label" text-anchor="end">{{oznaka["vrednost"]}}</text>
            % end
            % for oznaka in dashboard["graf"]["x_oznake"]:
            <text x="{{oznaka['x']}}" y="326" class="axis-label" text-anchor="middle">{{oznaka["vrednost"]}}</text>
            % end
            <line x1="74" y1="292" x2="876" y2="292" class="axis"></line>
            <line x1="74" y1="28" x2="74" y2="292" class="axis"></line>
            <polygon points="{{dashboard['graf']['ploskev']}}" class="area"></polygon>
            <polyline points="{{dashboard['graf']['crta']}}" class="line"></polyline>
            % for tocka in dashboard["graf"]["tocke"]:
            <circle cx="{{tocka['x']}}" cy="{{tocka['y']}}" r="3" class="point">
                <title>{{tocka["datum"]}}: {{tocka["vrednost"]}}</title>
            </circle>
            % end
        </svg>

        <div class="chart-stats">
            <span>Low <strong>{{dashboard["graf"]["najmanjsa"]}}</strong></span>
            <span>Average <strong>{{dashboard["graf"]["povprecje"]}}</strong></span>
            <span>High <strong>{{dashboard["graf"]["najvecja"]}}</strong></span>
        </div>

        % if dashboard["napaka"]:
        <p class="notice">Live data could not be reached, so the page is showing cached or sample data.</p>
        % end
    </section>
</main>
