// Jamendo provider for Mornye / MornyeFMT.
// Uses the official Jamendo API v3.0 (https://developer.jamendo.com/v3.0).
// Downloads only tracks Jamendo marks as downloadable (audiodownload_allowed).

const API = "https://api.jamendo.com/v3.0";
const PROVIDER_ID = "fedmedtim.jamendo";
const EXTENSIONS = {mp31: "mp3", mp32: "mp3", ogg: "ogg", flac: "flac"};

let clientId = "";
let format = "mp32";

function initialize(settings) {
  clientId = String((settings && settings.client_id) || "").trim();
  const chosen = String((settings && settings.format) || "").trim();
  if (EXTENSIONS[chosen]) format = chosen;
}

function api(path, params) {
  if (!clientId) {
    throw new Error("Set your Jamendo client ID in the extension settings (devportal.jamendo.com).");
  }
  const all = Object.assign({client_id: clientId, format: "json"}, params);
  const query = Object.keys(all)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(String(all[key])))
    .join("&");
  const response = http.get(API + path + "?" + query, {Accept: "application/json"});
  if (response.error) throw new Error("Jamendo request failed: " + response.error);
  if (response.statusCode !== 200) throw new Error("Jamendo returned HTTP " + response.statusCode);
  const data = JSON.parse(response.body);
  if (!data.headers || data.headers.status !== "success") {
    throw new Error("Jamendo error: " + ((data.headers && data.headers.error_message) || "unknown"));
  }
  return data.results || [];
}

function toTrack(item) {
  return {
    id: String(item.id),
    name: item.name || "",
    artists: item.artist_name || "",
    album_name: item.album_name || "",
    album_artist: item.artist_name || "",
    duration_ms: (Number(item.duration) || 0) * 1000,
    cover_url: item.album_image || item.image || "",
    preview_url: item.audio || "",
    release_date: item.releasedate || "",
    track_number: Number(item.position) || 0,
    copyright: item.license_ccurl ? "License: " + item.license_ccurl : "",
    comment: "Jamendo track " + item.id + (item.license_ccurl ? " | " + item.license_ccurl : ""),
    provider_id: PROVIDER_ID
  };
}

function searchTracks(query, limit) {
  const results = api("/tracks/", {
    search: String(query || ""),
    limit: String(Math.min(Math.max(Number(limit) || 20, 1), 50)),
    audiodlformat: format,
    include: "licenses"
  });
  return {tracks: results.filter(item => item.audiodownload_allowed).map(toTrack)};
}

function customSearch(query) {
  return searchTracks(query, 30).tracks;
}

function getTrack(id) {
  const results = api("/tracks/", {id: String(id), audiodlformat: format, include: "licenses"});
  return results.length ? toTrack(results[0]) : null;
}

const normalize = value => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

// Tracks found through this extension carry their Jamendo id. For tracks from
// other sources, only an exact artist and title match on Jamendo counts.
function checkAvailability(isrc, trackName, artistName, options) {
  const track = (options && options.track) || {};
  if (track.provider_id === PROVIDER_ID && track.id) {
    return {available: true, track_id: String(track.id)};
  }
  const title = normalize(trackName);
  const artist = normalize(artistName);
  if (!title) return {available: false, reason: "No track name to search for"};
  const results = api("/tracks/", {
    search: (artist + " " + title).trim(),
    limit: "10",
    audiodlformat: format
  });
  const match = results.find(item =>
    item.audiodownload_allowed &&
    normalize(item.name) === title &&
    (!artist || artist.includes(normalize(item.artist_name)) || normalize(item.artist_name).includes(artist)));
  return match
    ? {available: true, track_id: String(match.id)}
    : {available: false, reason: "Not available on Jamendo under a downloadable Creative Commons license"};
}

function download(trackId, quality, outputPath) {
  const results = api("/tracks/", {id: String(trackId), audiodlformat: format});
  const item = results[0];
  if (!item) return {success: false, error_type: "not_found", error_message: "Track not found on Jamendo"};
  if (!item.audiodownload_allowed || !item.audiodownload) {
    return {success: false, error_type: "not_found", error_message: "The artist does not allow downloads of this track"};
  }
  const result = file.download(item.audiodownload, outputPath);
  if (!result || !result.success) {
    return {success: false, error_type: "network_error",
      error_message: "Download failed: " + ((result && result.error) || "unknown error")};
  }
  return {success: true, file_path: outputPath, actual_extension: EXTENSIONS[format]};
}

registerExtension({initialize, searchTracks, customSearch, getTrack, checkAvailability, download});
