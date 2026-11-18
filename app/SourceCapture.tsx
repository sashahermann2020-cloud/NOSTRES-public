"use client";

import { useEffect } from "react";
import { captureSource } from "./traffic-source";

/** Запоминает источник захода для технической статистики; ничего не показывает. */
export default function SourceCapture() {
  useEffect(() => { captureSource(); }, []);
  return null;
}
