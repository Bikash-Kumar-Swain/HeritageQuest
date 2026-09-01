/* ==========================================================================
   GeoQuest Interactive 3D Explorer & Ancient Stone Pedestal
   Built with Three.js — 360° Rotatable Character with Touch & Mouse Controls
   ========================================================================== */

import * as THREE from 'three';

export class Explorer3DViewer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.characterGroup = null;
    this.pedestalGroup = null;
    this.particlesGroup = null;

    // Interaction State
    this.isDragging = false;
    this.previousMouseX = 0;
    this.rotationVelocity = 0;
    this.targetRotationY = 0;
    this.currentRotationY = 0;
    this.idleTime = 0;
    this.autoRotateSpeed = 0.004;

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || 360;
    const height = this.canvas.clientHeight || 420;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 1.25, 4.4);
    this.camera.lookAt(0, 0.75, 0);

    // 3. Renderer with alpha transparency
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting (Sunset Golden Glow & Ancient Ruins Rim Light)
    this.setupLighting();

    // 5. Build Ancient Stone Pedestal
    this.buildPedestal();

    // 6. Build Stylized 3D Hero Explorer Model
    this.buildExplorerModel();

    // 7. Ambient Floating Embers inside 3D space
    this.buildAuraParticles();

    // 8. Event Listeners for Touch and Mouse 360° Drag Rotation
    this.setupInteractions();

    // 9. Animation Loop
    this.animate = this.animate.bind(this);
    this.animationFrame = requestAnimationFrame(this.animate);

    // 10. Resize observer
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  setupLighting() {
    // Ambient Warm Cave/Valley Light
    const ambientLight = new THREE.AmbientLight(0x2a1f14, 2.2);
    this.scene.add(ambientLight);

    // Golden Sunset Sun Key Light
    const sunLight = new THREE.DirectionalLight(0xffdf88, 3.8);
    sunLight.position.set(2, 5, 3);
    sunLight.castShadow = true;
    this.scene.add(sunLight);

    // Golden Rim / Backlight (creates the magical halo around the silhouette)
    const rimLight = new THREE.DirectionalLight(0xf5b041, 4.5);
    rimLight.position.set(-1, 3, -4);
    this.scene.add(rimLight);

    // Torch / Ember Under-Glow from Dais
    const daisGlow = new THREE.PointLight(0xd4af37, 2.5, 3.5);
    daisGlow.position.set(0, 0.2, 0);
    this.scene.add(daisGlow);
  }

  buildPedestal() {
    this.pedestalGroup = new THREE.Group();

    // Materials
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x241e17,
      roughness: 0.85,
      metalness: 0.15
    });

    const goldRuneMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.8,
      emissive: 0x8f6c18,
      emissiveIntensity: 0.45
    });

    // Lower Stepped Tier
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.75, 0.22, 32);
    const baseMesh = new THREE.Mesh(baseGeo, stoneMaterial);
    baseMesh.position.y = -0.32;
    baseMesh.receiveShadow = true;
    this.pedestalGroup.add(baseMesh);

    // Middle Tier
    const midGeo = new THREE.CylinderGeometry(1.35, 1.45, 0.2, 32);
    const midMesh = new THREE.Mesh(midGeo, stoneMaterial);
    midMesh.position.y = -0.12;
    midMesh.receiveShadow = true;
    this.pedestalGroup.add(midMesh);

    // Top Platform Tier
    const topGeo = new THREE.CylinderGeometry(1.15, 1.2, 0.18, 32);
    const topMesh = new THREE.Mesh(topGeo, stoneMaterial);
    topMesh.position.y = 0.06;
    topMesh.receiveShadow = true;
    this.pedestalGroup.add(topMesh);

    // Golden Outer Inscribed Ring
    const ringGeo = new THREE.TorusGeometry(1.05, 0.022, 12, 48);
    const ringMesh = new THREE.Mesh(ringGeo, goldRuneMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.155;
    this.pedestalGroup.add(ringMesh);

    // Inner 8-Pointed Star Sun Inscription
    for (let i = 0; i < 8; i++) {
      const rayGeo = new THREE.ConeGeometry(0.045, 0.5, 4);
      const rayMesh = new THREE.Mesh(rayGeo, goldRuneMaterial);
      const angle = (i * Math.PI) / 4;
      rayMesh.rotation.x = Math.PI / 2;
      rayMesh.rotation.z = angle;
      rayMesh.position.set(Math.sin(angle) * 0.45, 0.156, Math.cos(angle) * 0.45);
      this.pedestalGroup.add(rayMesh);
    }

    this.scene.add(this.pedestalGroup);
  }

  buildExplorerModel() {
    this.characterGroup = new THREE.Group();
    this.characterGroup.position.y = 0.15; // Standing on top of platform

    // Shared Palette Materials
    const leatherCoatMat = new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.7, metalness: 0.1 });
    const innerShirtMat = new THREE.MeshStandardMaterial({ color: 0x2d3a2e, roughness: 0.8 });
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0x6e261f, roughness: 0.75 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfab82, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2b1e17, roughness: 0.9 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x332a22, roughness: 0.8 });
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x1f1710, roughness: 0.65, metalness: 0.2 });
    const goldBuckleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.85 });
    const backpackMat = new THREE.MeshStandardMaterial({ color: 0x3d2919, roughness: 0.8 });
    const bedrollMat = new THREE.MeshStandardMaterial({ color: 0x5a4835, roughness: 0.9 });

    // --- LEGS & BOOTS ---
    // Left Leg
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.55, 12), pantsMat);
    leftLeg.position.set(-0.13, 0.38, 0);
    this.characterGroup.add(leftLeg);

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.22), bootsMat);
    leftBoot.position.set(-0.13, 0.08, 0.04);
    this.characterGroup.add(leftBoot);

    // Right Leg
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.55, 12), pantsMat);
    rightLeg.position.set(0.13, 0.38, 0);
    this.characterGroup.add(rightLeg);

    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.22), bootsMat);
    rightBoot.position.set(0.13, 0.08, 0.04);
    this.characterGroup.add(rightBoot);

    // --- TORSO & COAT ---
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.22), pantsMat);
    pelvis.position.set(0, 0.65, 0);
    this.characterGroup.add(pelvis);

    // Leather Belt & Gold Buckle
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16), bootsMat);
    belt.position.set(0, 0.72, 0);
    this.characterGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.04), goldBuckleMat);
    buckle.position.set(0, 0.72, 0.18);
    this.characterGroup.add(buckle);

    // Inner Chest / Tunic
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.24), innerShirtMat);
    chest.position.set(0, 0.94, 0);
    this.characterGroup.add(chest);

    // Leather Jacket Layers (Flared bottom tail)
    const jacketTail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.45, 12, 1, true), leatherCoatMat);
    jacketTail.rotation.x = Math.PI;
    jacketTail.position.set(0, 0.56, -0.02);
    this.characterGroup.add(jacketTail);

    const jacketShoulders = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.28), leatherCoatMat);
    jacketShoulders.position.set(0, 1.02, 0);
    this.characterGroup.add(jacketShoulders);

    // Expedition Neck Scarf
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.055, 12, 18), scarfMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.set(0, 1.18, 0.02);
    this.characterGroup.add(scarf);

    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.03), scarfMat);
    scarfTail.position.set(-0.06, 1.06, 0.15);
    scarfTail.rotation.z = -0.15;
    this.characterGroup.add(scarfTail);

    // --- EXPEDITION BACKPACK ---
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.18), backpackMat);
    backpack.position.set(0, 0.96, -0.2);
    this.characterGroup.add(backpack);

    const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.36, 12), bedrollMat);
    bedroll.rotation.z = Math.PI / 2;
    bedroll.position.set(0, 1.18, -0.22);
    this.characterGroup.add(bedroll);

    // Straps & Canteen Pouch
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.08), leatherCoatMat);
    pouch.position.set(-0.19, 0.72, 0.04);
    this.characterGroup.add(pouch);

    // --- ARMS & GLOVES ---
    // Left Arm
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.42, 10), leatherCoatMat);
    leftArm.position.set(-0.25, 0.92, 0);
    leftArm.rotation.z = 0.12;
    this.characterGroup.add(leftArm);

    const leftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.09), bootsMat);
    leftGlove.position.set(-0.28, 0.68, 0.02);
    this.characterGroup.add(leftGlove);

    // Right Arm
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.42, 10), leatherCoatMat);
    rightArm.position.set(0.25, 0.92, 0);
    rightArm.rotation.z = -0.12;
    this.characterGroup.add(rightArm);

    const rightGlove = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.09), bootsMat);
    rightGlove.position.set(0.28, 0.68, 0.02);
    this.characterGroup.add(rightGlove);

    // --- HEAD & TOUSLED HAIR ---
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.1, 10), skinMat);
    neck.position.set(0, 1.22, 0);
    this.characterGroup.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16), skinMat);
    head.position.set(0, 1.34, 0.02);
    this.characterGroup.add(head);

    // Tousled Hair Volumes
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.138, 14, 14), hairMat);
    hairTop.position.set(0, 1.38, -0.01);
    this.characterGroup.add(hairTop);

    // Front/Side Hair Strands
    const hairFront = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 4), hairMat);
    hairFront.rotation.x = 2.2;
    hairFront.position.set(-0.04, 1.42, 0.12);
    this.characterGroup.add(hairFront);

    const hairSide = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 4), hairMat);
    hairSide.rotation.z = -0.8;
    hairSide.position.set(0.12, 1.38, 0.05);
    this.characterGroup.add(hairSide);

    // Compass Pin Amulet on Chest
    const amulet = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 8), goldBuckleMat);
    amulet.rotation.x = Math.PI / 2;
    amulet.position.set(0, 1.05, 0.15);
    this.characterGroup.add(amulet);

    // Initial character facing camera slightly angled
    this.characterGroup.rotation.y = 0;
    this.scene.add(this.characterGroup);
  }

  buildAuraParticles() {
    this.particlesGroup = new THREE.Group();
    const count = 30;
    const geo = new THREE.SphereGeometry(0.015, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfae4a8, transparent: true, opacity: 0.7 });

    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.set(
        (Math.random() - 0.5) * 2.2,
        Math.random() * 2.0 + 0.1,
        (Math.random() - 0.5) * 2.2
      );
      p.userData = {
        speedY: Math.random() * 0.008 + 0.003,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 0.9 + 0.3
      };
      this.particlesGroup.add(p);
    }
    this.scene.add(this.particlesGroup);
  }

  setupInteractions() {
    const handleStart = (clientX) => {
      this.isDragging = true;
      this.previousMouseX = clientX;
      this.rotationVelocity = 0;
    };

    const handleMove = (clientX) => {
      if (!this.isDragging) return;
      const deltaX = clientX - this.previousMouseX;
      this.previousMouseX = clientX;

      // Rotate character in full 3D space
      const rotationSpeed = 0.0085;
      this.targetRotationY += deltaX * rotationSpeed;
      this.rotationVelocity = deltaX * rotationSpeed;
      this.idleTime = 0;
    };

    const handleEnd = () => {
      this.isDragging = false;
    };

    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => handleStart(e.clientX));
    window.addEventListener('mousemove', (e) => handleMove(e.clientX));
    window.addEventListener('mouseup', handleEnd);

    // Touch Events for Mobile
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', handleEnd);
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationFrame = requestAnimationFrame(this.animate);

    // Smooth inertia / damping on 360° rotation
    if (!this.isDragging) {
      this.idleTime += 0.016;
      // Gentle auto-rotation when user is idle
      if (this.idleTime > 2.5) {
        this.targetRotationY += this.autoRotateSpeed;
      }
      this.rotationVelocity *= 0.92;
      this.targetRotationY += this.rotationVelocity;
    }

    // Smooth lerp to target angle
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.12;

    if (this.characterGroup) {
      this.characterGroup.rotation.y = this.currentRotationY;

      // Subtle breathing idle animation
      const time = performance.now() * 0.0025;
      this.characterGroup.position.y = 0.15 + Math.sin(time) * 0.012;
      this.characterGroup.rotation.x = Math.sin(time * 0.8) * 0.015;
    }

    // Slowly rotate the ancient dais runes
    if (this.pedestalGroup) {
      this.pedestalGroup.rotation.y += 0.001;
    }

    // Animate 3D ambient gold aura dust
    if (this.particlesGroup) {
      this.particlesGroup.children.forEach(p => {
        p.position.y += p.userData.speedY;
        p.userData.angle += 0.01;
        p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
        p.position.z = Math.sin(p.userData.angle) * p.userData.radius;

        if (p.position.y > 2.2) {
          p.position.y = 0.1;
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('resize', this.onResize);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
