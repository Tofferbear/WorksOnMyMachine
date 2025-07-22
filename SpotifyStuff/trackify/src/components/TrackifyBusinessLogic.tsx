export default class TrackifyBusinessLogic {
    async convertMsToSongLength(songLengthInMs: number): Promise<string> {
        const dateTimeFromMs = new Date(songLengthInMs);

        return `${dateTimeFromMs.getUTCHours()}h : ${dateTimeFromMs.getUTCMinutes()}m : ${dateTimeFromMs.getUTCSeconds()}s`;
    }

    async getPlayCountJsonAsync(): Promise<any> {
        let playCountDataJson: any = {};

        try {
            playCountDataJson = (await import("PlayCounts.json")).default;
        } finally {
            return playCountDataJson;
        }
    }

    async getArtistWithMostPlays(): Promise<string> {
        const playCountDataJson = await this.getPlayCountJsonAsync();

        if (!playCountDataJson.hasOwnProperty("length")) {
            return "";
        }

        const artistPlayCounts: any = {};

        for (let trackIndex = 0; trackIndex < playCountDataJson.length; trackIndex++) {
            for (let artistIndex = 0; artistIndex < playCountDataJson[trackIndex].album.artists.length; artistIndex++) {
                const artistName = playCountDataJson[trackIndex].album.artists[artistIndex].name;
                if (artistPlayCounts.hasOwnProperty(artistName)) {
                    artistPlayCounts[artistName].playCounts += playCountDataJson[trackIndex].play_count;
                } else {
                    artistPlayCounts[artistName] = {
                        playCounts: playCountDataJson[trackIndex].play_count
                    }
                }
            }
        }

        let highestPlayCount = 0;
        let highestPlayCountArtist = "";

        for (const prop in artistPlayCounts) {
            if (prop !== "Various Artists" && artistPlayCounts.hasOwnProperty(prop) && artistPlayCounts[prop].playCounts > highestPlayCount) {
                highestPlayCount = artistPlayCounts[prop].playCounts;
                highestPlayCountArtist = prop;
            }
        }

        return `${highestPlayCountArtist} (${highestPlayCount})`;
    }


    async getAvgSongLength(): Promise<string> {
        const playCountDataJson = await this.getPlayCountJsonAsync();

        if (!playCountDataJson.hasOwnProperty("length")) {
            return "";
        }

        const avgSongLength = (playCountDataJson.reduce((sum: number, item: { duration_ms: number, play_count: number }) => sum + (item.duration_ms * item.play_count), 0) / await this.getTrackPlaySum());

        return await this.convertMsToSongLength(avgSongLength);
    }

    async getLongestSong(): Promise<string> {
        const playCountDataJson = await this.getPlayCountJsonAsync();

        if (!playCountDataJson.hasOwnProperty("length")) {
            return "";
        }

        const maxLengthSong = playCountDataJson.reduce((prev: any, current: any) => (prev.duration_ms > current.duration_ms) ? prev : current);
        const dateTimeFromMs = new Date(maxLengthSong.duration_ms);

        return `${maxLengthSong.name} (${dateTimeFromMs.getUTCHours()}h : ${dateTimeFromMs.getUTCMinutes()}m : ${dateTimeFromMs.getUTCSeconds()}s)`;
    }

    async getShortestSong(): Promise<string> {
        const playCountDataJson = await this.getPlayCountJsonAsync();

        if (!playCountDataJson.hasOwnProperty("length")) {
            return "";
        }

        const minLengthSong = playCountDataJson.reduce((prev: any, current: any) => (prev.duration_ms < current.duration_ms) ? prev : current);
        const dateTimeFromMs = new Date(minLengthSong.duration_ms);

        return `${minLengthSong.name} (${dateTimeFromMs.getUTCHours()}h : ${dateTimeFromMs.getUTCMinutes()}m : ${dateTimeFromMs.getUTCSeconds()}s)`;
    }

    async getTotalTimeListened(): Promise<string> {
        const playCountDataJson = await this.getPlayCountJsonAsync();

        if (!playCountDataJson.hasOwnProperty("length")) {
            return "";
        }

        const sumOfSongLengths = playCountDataJson.reduce((sum: number, item: { duration_ms: number, play_count: number }) => sum + (item.duration_ms * item.play_count), 0);
        const secInMs = 1000;
        const minInMs = 60000;
        const hourInMs = 3600000
        const dayInMs = 86400000
        const daysListened = Math.trunc(sumOfSongLengths / dayInMs);
        const hoursListened = Math.trunc((sumOfSongLengths % dayInMs) / hourInMs);
        const minutesListened = Math.trunc(((sumOfSongLengths % dayInMs) % hourInMs) / minInMs);
        const secondsListened = Math.trunc((((sumOfSongLengths % dayInMs) % hourInMs) % minInMs) / secInMs);
        const millisecondsListened = (((sumOfSongLengths % dayInMs) % hourInMs) % minInMs) % secInMs;

        return `${daysListened}d : ${hoursListened}h : ${minutesListened}m : ${secondsListened}s : ${millisecondsListened}ms`;
    }

    async getTrackPlayCounts(): Promise<any[]> {
        const trackPlayCounts: any[] = [];
        const playCountDataJson = (await this.getPlayCountJsonAsync())
            .sort((a: { play_count: number; }, b: { play_count: number; }) => b.play_count - a.play_count);

        if (!playCountDataJson.hasOwnProperty("length")) {
            return trackPlayCounts;
        }

        playCountDataJson.map(async (track: { name: string, album: any, duration_ms: number, play_count: number }) => {
            trackPlayCounts.push({
                trackTitle: track.name,
                artistName: track.album.artists.map((artist: { name: string; }) => artist.name).join(", "),
                trackLength: await this.convertMsToSongLength(track.duration_ms),
                playCount: track.play_count
            });
        });

        return trackPlayCounts;
    }

    async getArtistPlayCounts(): Promise<any[]> {
        const artistPlayCounts: any[] = [];
        const playCountDataJson = (await this.getPlayCountJsonAsync());
    
        if (!playCountDataJson.hasOwnProperty("length")) {
            return artistPlayCounts;
        }
    
        const artistPlayCountData: any[] = [];
    
        for (let trackIndex = 0; trackIndex < playCountDataJson.length; trackIndex++) {
            for (let artistIndex = 0; artistIndex < playCountDataJson[trackIndex].album.artists.length; artistIndex++) {
                const artistName = playCountDataJson[trackIndex].album.artists[artistIndex].name.trim();
    
                const artistPlayCountIndex = artistPlayCountData.findIndex((artistPlayCount: any) => artistPlayCount.artistName === artistName);
    
                if (artistPlayCountIndex !== -1) {
                    artistPlayCountData[artistPlayCountIndex].playCounts += playCountDataJson[trackIndex].play_count;
                } else {
                    artistPlayCountData.push({
                        artistName: artistName,
                        playCounts: playCountDataJson[trackIndex].play_count
                    });
                }
            }
        }
    
        const sortedArtistPlayCountData = artistPlayCountData.sort((a: any, b: any) => {
            if (b.playCounts !== a.playCounts) {
                return b.playCounts - a.playCounts;
            } else {
                const artistNameANumeric = parseInt(a.artistName);
                const artistNameBNumeric = parseInt(b.artistName);
                if (!isNaN(artistNameANumeric) && !isNaN(artistNameBNumeric)) {
                    return artistNameANumeric - artistNameBNumeric;
                } else if (!isNaN(artistNameANumeric) && isNaN(artistNameBNumeric)) {
                    return -1;
                } else if (isNaN(artistNameANumeric) && !isNaN(artistNameBNumeric)) {
                    return 1;
                } else {
                    return a.artistName.localeCompare(b.artistName, undefined, { numeric: true, sensitivity: 'base' });
                }
            }
        });
    
        sortedArtistPlayCountData.map((artistPlayCount: any) => {
            artistPlayCounts.push({
                artistName: artistPlayCount.artistName,
                playCount: artistPlayCount.playCounts
            });
        });
    
        return artistPlayCounts;
    }

    async getTrackPlaySum(): Promise<number> {
        const playCountDataJson = await this.getPlayCountJsonAsync();

        if (!playCountDataJson.hasOwnProperty("length")) {
            return 0;
        }

        return playCountDataJson.reduce((sum: number, item: { play_count: number }) => sum + item.play_count, 0);
    };

    async getUniqueTrackPlaySum(): Promise<number> {
        const playCountDataJson = await this.getPlayCountJsonAsync();

        if (!playCountDataJson.hasOwnProperty("length")) {
            return 0;
        }

        return playCountDataJson.length;
    }
}