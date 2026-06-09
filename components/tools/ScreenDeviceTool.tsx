"use client";
import { useEffect, useState } from "react";
import InfoTable from "@/components/InfoTable";
import { useLang } from "@/lib/i18n";

function getWebGLInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { renderer: "N/A", vendor: "N/A" };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    };
  } catch { return { renderer: "N/A", vendor: "N/A" }; }
}
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200; canvas.height = 50;
    const ctx = canvas.getContext("2d")!;
    ctx.textBaseline = "top"; ctx.font = "14px Arial";
    ctx.fillStyle = "#f60"; ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069"; ctx.fillText("Browser fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102,204,0,0.7)"; ctx.fillText("Browser fingerprint", 4, 17);
    return canvas.toDataURL().slice(-50);
  } catch { return "N/A"; }
}

export default function ScreenDeviceTool() {
  const { t } = useLang();
  const [info, setInfo] = useState<Record<string, string | number> | null>(null);

  useEffect(() => {
    const webgl = getWebGLInfo();
    const nav = navigator as Navigator & { deviceMemory?: number };
    setInfo({
      screenWidth: screen.width, screenHeight: screen.height, availWidth: screen.availWidth, availHeight: screen.availHeight,
      viewportWidth: window.innerWidth, viewportHeight: window.innerHeight, devicePixelRatio: window.devicePixelRatio,
      colorDepth: screen.colorDepth, touchPoints: navigator.maxTouchPoints, hardwareConcurrency: navigator.hardwareConcurrency ?? "N/A",
      deviceMemory: (nav.deviceMemory ?? "N/A") + " GB", platform: navigator.platform,
      webglRenderer: webgl.renderer, webglVendor: webgl.vendor, canvasHash: getCanvasFingerprint(), cookieEnabled: String(navigator.cookieEnabled),
    });
  }, []);

  const rows = info ? [
    { label: t("屏幕分辨率", "Resolution"), value: `${info.screenWidth} × ${info.screenHeight}` },
    { label: t("可用屏幕", "Available"), value: `${info.availWidth} × ${info.availHeight}` },
    { label: t("视口尺寸", "Viewport"), value: `${info.viewportWidth} × ${info.viewportHeight}` },
    { label: t("设备像素比", "Pixel ratio"), value: String(info.devicePixelRatio) },
    { label: t("颜色深度", "Color depth"), value: `${info.colorDepth} bit` },
    { label: t("触摸点数", "Touch points"), value: String(info.touchPoints) },
    { label: t("CPU 核心数", "CPU cores"), value: String(info.hardwareConcurrency) },
    { label: t("设备内存", "Device memory"), value: String(info.deviceMemory) },
    { label: t("平台", "Platform"), value: String(info.platform) },
    { label: t("GPU 渲染器", "GPU renderer"), value: String(info.webglRenderer) },
    { label: t("GPU 厂商", "GPU vendor"), value: String(info.webglVendor) },
    { label: t("Cookie 支持", "Cookies"), value: String(info.cookieEnabled) },
    { label: t("Canvas 指纹片段", "Canvas hash"), value: String(info.canvasHash) },
  ] : [];

  return info ? <InfoTable rows={rows} /> : <p className="text-muted py-5">{t("加载中…", "Loading…")}</p>;
}
