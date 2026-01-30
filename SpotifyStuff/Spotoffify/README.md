# 🎵 Spotoffify

![Build Status](https://img.shields.io/badge/Build-Works_On_My_Machine-brightgreen)
![Tech Stack](https://img.shields.io/badge/Tech-Over--Engineered-blueviolet)
![Coffee](https://img.shields.io/badge/Fuel-Coffee_&_Spite-brown)

## 🧐 What is this?

**Spotoffify** is what happens when a .NET developer gets impatient waiting for *Spotify Wrapped* and decides to build their own, but with more Azure and less graphic design budget.

It’s a Blazor WebAssembly dashboard that tracks my listening habits, judges my music taste in real-time, and provides a way to launch playlists on my Fire TV because the physical remote is currently lost in the couch cushions.

## 🚀 The "Features"

* **The Heatmap**: A GitHub-style contribution graph, but for noise pollution. It tells me exactly which hour of the week I am most productive (read: listening to music).
    * *Powered by "Unix Math" because Cosmos DB doesn't believe in Days of the Week.*
* **Hero Cards**: Vital stats like "Longest Track" (probably *Tool*) and "Shortest Track" (probably a mistake).
* **Total Commitment**: A live counter of how many days, hours, and minutes of my life I have dedicated to audio waves.
* **Tofforgery Tunes**: A custom playlist generator.
    * *Current Status: The shuffle logic is slightly clumpy. It really likes track #4. We're working on it.*
* **Fire TV Remote**: A button that deep-links into the Spotify TV app. It’s the lazy man’s ultimate tool.
* **One Play Wonders** *(Coming Soon)*: A graveyard for songs I played exactly once and immediately regretted.

## 🛠️ The Stack (Overkill Edition)

I could have done this with a script. I didn't.

* **Frontend**: Blazor WebAssembly (C# in the browser, as nature intended).
* **Backend**: Azure Functions (Serverless, because servers are heavy).
* **Database**: Azure Cosmos DB (Because I hate schemas and love JSON).
* **Charts**: ApexCharts (For making the data look smarter than it is).

## 🔧 How to Run It

1.  **Clone the repo.**
2.  **Fix the connection strings.** (I'm not giving you mine. Get your own Azure credits.)
3.  **Run the API.** `func start` and pray.
4.  **Run the Client.** `dotnet watch` and wait.
5.  **Open Browser.** If you see a green heatmap, you win. If you see a "UTC Offset Error," welcome to my world—subtract 8 hours and try again.

## 🐛 Known Issues

* The "Shuffle" button isn't truly random yet. It has favorites.
* The UI assumes you live in North Bend, WA (PST). If you don't, your "Monday Morning" plays will show up on "Sunday Night."
* CSS is mostly Bootstrap because I am a backend developer.

## 📜 License

**The "Works On My Machine" License**: You can use this code, but if it breaks your computer, deletes your playlists, or accidentally plays "Photograph" on repeat, I cannot be held responsible.
