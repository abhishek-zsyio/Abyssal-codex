"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { GraphThemeColors } from "@/types/graph";

interface GraphCanvasProps {
  themeColors: GraphThemeColors;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  onRequestRender: () => void;
}

export const GraphCanvas = ({
  themeColors,
  onCanvasReady,
  onRequestRender,
}: GraphCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeTexturesRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pre-render node textures
  useEffect(() => {
    const palette = [
      themeColors.primary, 
      themeColors.accent, 
      themeColors.destructive,
      themeColors.foreground,
      themeColors.muted,
      themeColors.secondary
    ];
    const cleanPalette = Array.from(new Set(palette.filter(Boolean)));
    const textures = new Map<string, HTMLCanvasElement>();
    
    cleanPalette.forEach(color => {
      const planetCanvas = document.createElement("canvas");
      planetCanvas.width = 48; planetCanvas.height = 48;
      const pctx = planetCanvas.getContext("2d");
      if (pctx) {
        pctx.beginPath(); pctx.arc(24, 24, 10, 0, Math.PI * 2);
        pctx.strokeStyle = color; pctx.lineWidth = 3; pctx.stroke();
        pctx.fillStyle = color + "66"; pctx.fill();
      }
      textures.set(`planet:${color}`, planetCanvas);

      const sunCanvas = document.createElement("canvas");
      sunCanvas.width = 160; sunCanvas.height = 160;
      const sctx = sunCanvas.getContext("2d");
      if (sctx) {
        sctx.beginPath(); sctx.arc(80, 80, 36, 0, Math.PI * 2);
        sctx.strokeStyle = color; sctx.lineWidth = 6; sctx.stroke();
        sctx.fillStyle = color + "33"; sctx.fill();
        sctx.beginPath(); sctx.arc(80, 80, 48, 0, Math.PI * 2);
        sctx.strokeStyle = color + "44"; sctx.lineWidth = 2; sctx.stroke();
      }
      textures.set(`sun:${color}`, sunCanvas);

      const miniSunCanvas = document.createElement("canvas");
      miniSunCanvas.width = 96; miniSunCanvas.height = 96;
      const msctx = miniSunCanvas.getContext("2d");
      if (msctx) {
        msctx.beginPath(); msctx.arc(48, 48, 22, 0, Math.PI * 2);
        msctx.strokeStyle = color; msctx.lineWidth = 4; msctx.stroke();
        msctx.fillStyle = color + "22"; msctx.fill();
      }
      textures.set(`minisun:${color}`, miniSunCanvas);

      const rogueCanvas = document.createElement("canvas");
      rogueCanvas.width = 48; rogueCanvas.height = 48;
      const rctx = rogueCanvas.getContext("2d");
      if (rctx) {
        rctx.beginPath(); rctx.arc(24, 24, 9, 0, Math.PI * 2);
        rctx.strokeStyle = color; rctx.lineWidth = 2.5; rctx.stroke();
        rctx.setLineDash([3, 3]);
        rctx.beginPath(); rctx.arc(24, 24, 14, 0, Math.PI * 2);
        rctx.strokeStyle = color + "44"; rctx.stroke();
        rctx.setLineDash([]);
      }
      textures.set(`rogue:${color}`, rogueCanvas);
    });
    nodeTexturesRef.current = textures;
    onRequestRender();
  }, [themeColors, onRequestRender]);

  const setupOffscreen = useCallback((width: number, height: number) => {
    const dpr = window.devicePixelRatio || 1;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = width * dpr; offscreenCanvas.height = height * dpr;
    const offscreenCtx = offscreenCanvas.getContext("2d");
    if (offscreenCtx) {
      offscreenCtx.scale(dpr, dpr);
      offscreenCtx.fillStyle = themeColors.background;
      offscreenCtx.fillRect(0, 0, width, height);
      
      const starColor = themeColors.foreground;
      offscreenCtx.fillStyle = starColor;
      for (let i = 0; i < 60; i++) {
        offscreenCtx.globalAlpha = Math.random() * 0.2;
        offscreenCtx.beginPath();
        offscreenCtx.arc(Math.random() * width, Math.random() * height, Math.random() * 0.7, 0, Math.PI * 2);
        offscreenCtx.fill();
      }
      offscreenCtx.globalAlpha = 1.0;
    }
    offscreenCanvasRef.current = offscreenCanvas;
  }, [themeColors]);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
      const rect = canvasRef.current.getBoundingClientRect();
      setupOffscreen(rect.width, rect.height);
    }
  }, [onCanvasReady, setupOffscreen]);

  // Main rendering logic would ideally be here or called from here
  // For now, we'll just provide the canvas ref and handle basic resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        const rect = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width * dpr; 
        canvasRef.current.height = rect.height * dpr;
        setupOffscreen(rect.width, rect.height);
        onRequestRender();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onRequestRender, setupOffscreen]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

GraphCanvas.displayName = "GraphCanvas";
