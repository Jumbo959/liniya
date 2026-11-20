"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildBlocks, modelCenter } from "@/lib/model";
import type { PlanRoom, WindowSide } from "@/lib/types";

export function Viewer3D({
  rooms,
  windowSides,
  ceiling,
  selected,
  onSelect,
  furniture,
  night,
}: {
  rooms: PlanRoom[];
  windowSides: WindowSide[];
  ceiling: number;
  selected: number | null;
  onSelect: (index: number) => void;
  furniture: boolean;
  night: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const floors = useRef<Map<number, THREE.Mesh>>(new Map());
  const furnitureRef = useRef<THREE.Group | null>(null);
  const lights = useRef<{ amb: THREE.AmbientLight; dir: THREE.DirectionalLight; renderer: THREE.WebGLRenderer } | null>(null);
  const [failed, setFailed] = useState(false);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor("#d9d2c6");
    el.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.02;
    controls.target.set(0, 0.9, 0);

    const amb = new THREE.AmbientLight("#fff4e4", 0.72);
    const dir = new THREE.DirectionalLight("#fff7ea", 1.15);
    dir.position.set(8, 14, 6);
    const fill = new THREE.DirectionalLight("#d5e4ea", 0.35);
    fill.position.set(-6, 8, -4);
    scene.add(amb, dir, fill);
    lights.current = { amb, dir, renderer };

    const center = modelCenter(rooms);
    const blocks = buildBlocks(rooms, windowSides, ceiling);
    const furn = new THREE.Group();
    floors.current = new Map();
    for (const block of blocks) {
      const geo = new THREE.BoxGeometry(block.sx, block.sy, block.sz);
      const mat = new THREE.MeshStandardMaterial({
        color: block.color,
        roughness: block.kind === "glass" ? 0.08 : 0.86,
        metalness: 0,
        transparent: block.opacity < 1,
        opacity: block.opacity,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(block.cx - center.x, block.cy, block.cz - center.z);
      mesh.userData.room = block.room;
      mesh.userData.kind = block.kind;
      if (block.kind === "furniture") furn.add(mesh);
      else scene.add(mesh);
      if (block.kind === "floor") floors.current.set(block.room, mesh);
    }
    scene.add(furn);
    furnitureRef.current = furn;

    const dist = Math.max(center.w, center.d) * 1.15 + 4;
    camera.position.set(dist * 0.85, dist * 0.72, dist * 0.85);

    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    const resize = () => {
      const w = el.clientWidth || 640;
      const h = el.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    const pointer = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    let down = { x: 0, y: 0, moved: false };
    const canvas = renderer.domElement;
    const onDown = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY, moved: false };
    };
    const onMove = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) down.moved = true;
    };
    const onUp = (event: PointerEvent) => {
      if (down.moved) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects([...floors.current.values()], false);
      if (hits[0]) onSelectRef.current(hits[0].object.userData.room as number);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      controls.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose?.();
      });
      renderer.dispose();
      lights.current = null;
    };
  }, [rooms, windowSides, ceiling]);

  useEffect(() => {
    floors.current.forEach((mesh, index) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat.userData.base) mat.userData.base = `#${mat.color.getHexString()}`;
      mat.color.set(index === selected ? "#e7b2a4" : (mat.userData.base as string));
    });
  }, [selected, rooms]);

  useEffect(() => {
    if (furnitureRef.current) furnitureRef.current.visible = furniture;
  }, [furniture, rooms]);

  useEffect(() => {
    const pack = lights.current;
    if (!pack) return;
    pack.renderer.setClearColor(night ? "#1a1916" : "#d9d2c6");
    pack.amb.intensity = night ? 0.25 : 0.72;
    pack.dir.intensity = night ? 0.35 : 1.15;
    pack.dir.color.set(night ? "#ffb36b" : "#fff7ea");
  }, [night, rooms]);

  if (failed) return <p className="viewer-loading">Браузер не открыл 3D. Планировка сверху остаётся основной.</p>;
  return <div ref={host} className="viewer-canvas" />;
}
