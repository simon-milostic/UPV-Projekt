<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Crypto market dashboard</title>
    <link rel="stylesheet" href="/style/style.css">
</head>
<body>
    <header class="site-header">
        <a href="/" class="brand">Market Scraper</a>
        <nav aria-label="Primary navigation">
    
            <!-- The following three lines are mostly for desgin, the class='active' if we're on the said page,
            little navigation buttons will be highlighted. -->

            <a href="/" class="{{'active' if aktivna_stran == 'overview' else ''}}">Overview</a> 
            <a href="/crypto/" class="{{'active' if aktivna_stran == 'crypto' else ''}}">Crypto</a>
            <a href="/about/" class="{{'active' if aktivna_stran == 'about' else ''}}">Data</a>
        </nav>
    </header>
    {{!base}}
    <script src="/style/script.js" defer></script>
</body>
</html>
