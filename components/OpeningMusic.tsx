"use client";

import { useEffect } from "react";

type MusicWindow = Window & { __kurdnameOpeningAudio?: HTMLAudioElement };

const key = "kurdname-opening-music-v4";
const positionKey = key + "-position";
const limit = 9.4;
const baseVolume = 0.75;
const fadeStart = 8.7;

function read(key: string) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function write(key: string, value: string) {
  try { sessionStorage.setItem(key, value); } catch {}
}

function startOpeningMusic() {
  const host = window as MusicWindow;
  if (host.__kurdnameOpeningAudio || read(key) === "1") return;

  const audio = new Audio("/opening-music.mp3");
  host.__kurdnameOpeningAudio = audio;
  audio.preload = "auto";
  audio.volume = baseVolume;
  audio.loop = false;

  let finished = false;
  const saved = Number(read(positionKey) || 0);
  let restored = false;
  const events = ["pointerup", "touchend", "click", "keydown"] as const;

  function restore() {
    if (restored) return;
    restored = true;
    if (Number.isFinite(saved) && saved > 0 && saved < limit) {
      audio.currentTime = saved;
    }
  }

  function save() {
    if (finished || !restored || audio.currentTime <= 0) return;
    write(positionKey, String(Math.min(audio.currentTime, limit)));
  }

  function removeGestures() {
    for (const event of events) window.removeEventListener(event, play, true);
  }

  function play() {
    if (finished || !audio.paused) return;
    if (audio.readyState >= 1) restore();
    void audio.play().catch(() => {});
  }

  function complete() {
    if (finished) return;
    finished = true;
    write(key, "1");
    write(positionKey, String(limit));
    audio.pause();
    removeGestures();
    window.removeEventListener("pagehide", save);
    window.removeEventListener("pageshow", play);
    audio.removeEventListener("timeupdate", tick);
    audio.removeEventListener("loadedmetadata", restore);
    audio.removeEventListener("playing", onPlaying);
    audio.removeEventListener("ended", complete);
    audio.removeEventListener("error", onError);
  }

  function tick() {
    if (audio.currentTime >= limit) complete();
    else {
      if (audio.currentTime >= fadeStart) {
        audio.volume = baseVolume * Math.max(0, (limit - audio.currentTime) / (limit - fadeStart));
      }
      save();
    }
  }

  function onPlaying() {
    if (finished) { audio.pause(); return; }
    restore();
    save();
    removeGestures();
  }

  function onError() {
    removeGestures();
    window.removeEventListener("pagehide", save);
    window.removeEventListener("pageshow", play);
  }

  audio.addEventListener("loadedmetadata", restore);
  audio.addEventListener("playing", onPlaying);
  audio.addEventListener("timeupdate", tick);
  audio.addEventListener("ended", complete);
  audio.addEventListener("error", onError);
  for (const event of events) {
    window.addEventListener(event, play, { capture: true, passive: true });
  }
  window.addEventListener("pagehide", save);
  window.addEventListener("pageshow", play);
  play();
}

export default function OpeningMusic() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    startOpeningMusic();
    // The single audio instance belongs to this browser document, not a
    // React page. Route changes and component remounts must not stop it.
  }, []);
  return null;
}
