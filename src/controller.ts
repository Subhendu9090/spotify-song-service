import { sql } from "./db.js";
import { TryCatch } from "./utils/TryCatch.js";
import { redisClient } from "./index.js";

export const getAllAlbums = TryCatch(async (req, res) => {
  let albums;
  const CATCH_EXPIRY = 1800;

  if (redisClient.isReady) {
    albums = await redisClient.get("albums");
  }

  if (albums) {
    console.log("Catch hit");
    res.json(JSON.parse(albums));
    return;
  } else {
    console.log("Catch miss");
    albums = await sql`select * from albums`;
    if (redisClient.isReady) {
      await redisClient.set("albums", JSON.stringify(albums), {
        EX: CATCH_EXPIRY,
      });
    }
    res.json(albums);
  }
});

export const getAllSongs = TryCatch(async (req, res) => {
  const CACHE_EXPIRY = 1800;
  let songs;
  if (redisClient.isReady) {
    songs = await redisClient.get("songs");
  }
  if (songs) {
    console.log("Catch Hit");
    res.json(JSON.parse(songs));
    return;
  } else {
    console.log("Catch Miss");
    songs = await sql`select * from songs`;
    if (redisClient.isReady) {
      await redisClient.set("songs", JSON.stringify(songs), {
        EX: CACHE_EXPIRY,
      });
    }
    res.json(songs);
    return;
  }
});

export const getSongsByAlbums = TryCatch(async (req, res) => {
  const { id } = req.params;
  let albums, songs;
  const CACHE_EXPIRY=1800;
  
  if (redisClient.isReady) {
    const cacheData = await redisClient.get(`album_songs_${id}`)
    if (cacheData) {
      console.log("cache Hit")
      res.json(JSON.parse(cacheData));
      return
    }
  }

  albums = await sql`select * from albums where id=${id}`;

  if (albums.length === 0) {
    res.status(404).json({ message: "Album Not found" });
    return;
  }
  songs = await sql`select * from songs where album_id=${id}`;

  const response = { songs, album: albums[0] };
  if (redisClient.isReady) {
    await redisClient.set(`album_songs_${id}`,JSON.stringify(response),{
      EX:CACHE_EXPIRY
    })
  }
  console.log("cache miss")
  res.json(response);
});

export const getSingleSong = TryCatch(async (req, res) => {
  const song = await sql`select * from songs where id=${req.params.id}`;
  res.json(song[0]);
});
