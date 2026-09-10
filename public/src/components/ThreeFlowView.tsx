import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

type Props = {
  header: { diameterIn: number; lengthIn: number; roughness: number };
  rpm: number;
  exhaustVelocity: number;
};

export default function ThreeFlowView({ header, rpm, exhaustVelocity }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const width = mountRef.current?.clientWidth || 600;
    const height = mountRef.current?.clientHeight || 400;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current!.innerHTML = '';
    mountRef.current!.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Header tube geometry
    const radius = (header.diameterIn * 0.0254) / 2; // meters
    const length = header.lengthIn * 0.0254;
    const tubeGeom = new THREE.CylinderGeometry(radius, radius, length, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.6, roughness: 0.4 });
    const tube = new THREE.Mesh(tubeGeom, mat);
    tube.rotation.z = Math.PI / 2;
    scene.add(tube);

    // Particle system
    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const x = -length / 2 + Math.random() * length;
      const y = (Math.random() - 0.5) * radius * 1.6;
      const z = (Math.random() - 0.5) * radius * 1.6;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      velocities[i * 3] = 0.5 + Math.random() * 0.5;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffaa33, size: 0.03 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frame = 0;
    function animate() {
      frame++;
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        // move along x by exhaustVelocity scaled
        pos[idx] += (exhaustVelocity * 0.02) * (0.5 + Math.sin((frame + i) * 0.02) * 0.5);
        // wrap
        if (pos[idx] > length / 2) pos[idx] = -length / 2;
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || 600;
      const h = mountRef.current?.clientHeight || 400;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [header, rpm, exhaustVelocity]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ height: '100%', width: '100%' }} ref={mountRef} />
    </div>
  );
}
