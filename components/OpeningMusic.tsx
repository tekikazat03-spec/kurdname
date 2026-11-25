"use client";

import { useEffect } from "react";

export default function OpeningMusic() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    const key = "kurdname-opening-music-v2";
    try { if (sessionStorage.getItem(key) === "1") return; } catch {}

    const audio = new Audio("/opening-music.mp3");
    audio.preload = "auto";
    audio.volume = 0.75;
    audio.loop = false;
    let finished = false;
    let started = false;
    const events = ["pointerup", "touchend", "click", "keydown"] as const;
    function removeGestures() {
      for (const event of events) window.removeEventListener(event, play, true);
    }
    function play() {
      if (finished || started) return;
      void audio.play().catch(() => {});
    }
    function stop() {
      finished = true;
      audio.pause();
      removeGestures();
    }
    function onPlaying() {
      if (finished) { audio.pause(); return; }
      started = true;
      removeGestures();
    }
    function complete() {
      if (!finished) {
        try { sessionStorage.setItem(key, "1"); } catch {}
      }
      stop();
    }
    function onTimeUpdate() {
      if (audio.currentTime >= 15) complete();
    }
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", complete);
    audio.addEventListener("error", stop);
    for (const event of events) window.addEventListener(event, play, { capture: true, passive: true });
    play();
    return () => {
      stop();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", complete);
      audio.removeEventListener("error", stop);
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);
  return null;
}
