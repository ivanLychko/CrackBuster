import React, { useEffect, useRef } from 'react';
import './CrackInjectionBackground.scss';

class CrackInjectionBackgroundClass {
  constructor(container, settings = {}) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.cracks = [];
    this.injections = [];
    this.mouse = { x: 0, y: 0 };
    this.time = 0;
    this.lastCrackTime = 0;
    this.settings = {
      crackInterval: settings.crackInterval || 2000,
      crackCount: settings.crackCount || 40, // Уменьшено для оптимизации
      injectionRadius: settings.injectionRadius || 80,
      injectionSpeed: settings.injectionSpeed || 1.5,
      scrollSensitivity: settings.scrollSensitivity || 0.7,
    };
    this.scrollY = 0;
    this.lastScrollY = 0;
    this.scrollGrowthBoost = 0; // Ускорение роста при прокрутке
    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('scroll', () => this.handleScroll());

    // Add event listeners to canvas
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    // Also listen to document clicks to catch clicks on empty areas
    this.documentClickHandler = (e) => {
      const target = e.target;

      // Check if click is on a modal/overlay (should not trigger background effect)
      const isModal = target.closest('.lightbox-overlay, .image-modal, .image-picker-modal, [class*="modal"], [class*="overlay"]');

      // Always trigger background effect unless it's a modal
      if (!isModal && target.closest('.app')) {
        this.handleClick({ clientX: e.clientX, clientY: e.clientY });
      }
    };

    this.documentMouseDownHandler = (e) => {
      const target = e.target;

      // Check if click is on a modal/overlay (should not trigger background effect)
      const isModal = target.closest('.lightbox-overlay, .image-modal, .image-picker-modal, [class*="modal"], [class*="overlay"]');

      // Always trigger background effect unless it's a modal
      if (!isModal && target.closest('.app')) {
        this.isInjecting = true;
        this.handleMouseDown({ clientX: e.clientX, clientY: e.clientY });
      }
    };

    this.documentMouseUpHandler = (e) => {
      this.isInjecting = false;
      this.handleMouseUp(e);
    };

    this.documentMouseMoveHandler = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      if (this.isInjecting) {
        this.handleMouseMove({ clientX: e.clientX, clientY: e.clientY });
      }
    };

    document.addEventListener('click', this.documentClickHandler);
    document.addEventListener('mousedown', this.documentMouseDownHandler);
    document.addEventListener('mouseup', this.documentMouseUpHandler);
    document.addEventListener('mousemove', this.documentMouseMoveHandler);

    this.createCracks();
    this.animate();
  }

  handleScroll() {
    const currentScrollY = window.scrollY || window.pageYOffset;
    const scrollDelta = Math.abs(currentScrollY - this.lastScrollY);

    // При прокрутке ускоряем проявление существующих трещин
    if (scrollDelta > 10) {
      this.scrollGrowthBoost = Math.min(1.0, (scrollDelta / 100) * this.settings.scrollSensitivity);
      // Иногда создаем новую трещину, но редко
      if (Math.random() > (1 - this.settings.scrollSensitivity * 0.2) && this.cracks.length < this.settings.crackCount * 0.8) {
        this.createRandomCrack();
      }
    } else {
      this.scrollGrowthBoost = 0;
    }

    this.lastScrollY = currentScrollY;
  }

  resize() {
    // Фиксируем размер canvas размером экрана (viewport)
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Не пересоздаем трещины, только масштабируем координаты если нужно
    // Трещины продолжат расти естественным образом
  }

  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    // Continuous injection while holding
    if (this.isInjecting) {
      this.addInjection(e.clientX, e.clientY);
    }
  }

  handleClick(e) {
    this.addInjection(e.clientX, e.clientY);
  }

  handleMouseDown(e) {
    this.isInjecting = true;
    this.addInjection(e.clientX, e.clientY);
  }

  handleMouseUp(e) {
    this.isInjecting = false;
  }

  addInjection(x, y) {
    this.injections.push({
      x,
      y,
      radius: 0,
      maxRadius: this.settings.injectionRadius,
      life: 1,
      speed: this.settings.injectionSpeed,
      particles: [],
    });

    // Add particles
    for (let i = 0; i < 5; i++) {
      this.injections[this.injections.length - 1].particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: 0,
        maxDistance: Math.random() * 40 + 20,
        speed: Math.random() * 1 + 0.5,
        size: Math.random() * 3 + 1,
      });
    }
  }

  createCracks() {
    this.cracks = [];
    // Создаем больше основных трещин (очагов) - меньше ветвления, больше очагов
    const mainCracksCount = 8 + Math.floor(Math.random() * 5); // 8-12 основных трещин (очагов)
    for (let i = 0; i < mainCracksCount; i++) {
      this.createMainCrack();
    }
    
    // Создаем меньше ветвей от существующих трещин
    const branchCount = 5 + Math.floor(Math.random() * 5); // 5-10 ветвей (вместо 15-25)
    for (let i = 0; i < branchCount; i++) {
      this.createBranchFromExistingCrack();
    }
  }

  createMainCrack() {
    // Создаем основную трещину от случайной точки на краю экрана
    const edge = Math.floor(Math.random() * 4); // 0-верх, 1-право, 2-низ, 3-лево
    let startX, startY;
    
    switch(edge) {
      case 0: // Верх
        startX = Math.random() * this.canvas.width;
        startY = 0;
        break;
      case 1: // Право
        startX = this.canvas.width;
        startY = Math.random() * this.canvas.height;
        break;
      case 2: // Низ
        startX = Math.random() * this.canvas.width;
        startY = this.canvas.height;
        break;
      case 3: // Лево
        startX = 0;
        startY = Math.random() * this.canvas.height;
        break;
    }
    
    this.createCrackFromPoint(startX, startY, true);
  }

  createBranchFromExistingCrack() {
    // Создаем ветвь от существующей трещины
    if (this.cracks.length === 0) {
      // Если нет трещин, создаем обычную
      this.createCrackFromPoint(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        false
      );
      return;
    }
    
    // Выбираем случайную трещину
    const randomCrack = this.cracks[Math.floor(Math.random() * this.cracks.length)];
    if (!randomCrack.points || randomCrack.points.length === 0) {
      this.createCrackFromPoint(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        false
      );
      return;
    }
    
    // Выбираем случайную точку из трещины (но не первую и не последнюю)
    const pointIndex = Math.floor(Math.random() * (randomCrack.points.length - 2)) + 1;
    const branchPoint = randomCrack.points[pointIndex];
    
    // Создаем ветвь от этой точки
    const angle = Math.atan2(
      randomCrack.points[pointIndex + 1].y - branchPoint.y,
      randomCrack.points[pointIndex + 1].x - branchPoint.x
    );
    
    // Угол ответвления (перпендикулярно или под углом)
    const branchAngle = angle + (Math.random() - 0.5) * 2.5 + (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
    
    this.createBranchFromPoint(branchPoint.x, branchPoint.y, branchAngle);
  }

  createCrackFromPoint(startX, startY, isMain = false) {
    // Создаем трещину от заданной точки
    const points = [];
    let x = startX;
    let y = startY;
    const segments = isMain 
      ? Math.floor(Math.random() * 50) + 40  // Основные трещины длиннее (40-90 сегментов)
      : Math.floor(Math.random() * 40) + 25; // Обычные (25-65 сегментов)
    let mainAngle = isMain
      ? Math.atan2(this.canvas.height / 2 - startY, this.canvas.width / 2 - startX) + (Math.random() - 0.5) * 0.5
      : Math.random() * Math.PI * 2;
    
    // Базовая ширина трещины
    const baseWidth = isMain
      ? Math.random() * 1.5 + 1.0  // Основные трещины шире (1.0-2.5px)
      : Math.random() * 1.2 + 0.4; // Обычные (0.4-1.6px)
    const maxWidth = baseWidth * (1.5 + Math.random() * 1.5);

    for (let j = 0; j < segments; j++) {
      const progress = j / segments;
      
      const widthProgress = progress < 0.3 
        ? progress / 0.3 * 0.5
        : 0.5 + (progress - 0.3) / 0.7 * 0.5;
      const currentWidth = baseWidth + (maxWidth - baseWidth) * widthProgress + Math.random() * 0.3;
      
      points.push({ 
        x, 
        y, 
        filled: false,
        width: Math.max(0.3, Math.min(5, currentWidth))
      });
      
      // Более резкие и неровные углы для зигзагообразных трещин
      const sharpTurn = Math.random() < 0.2 ? (Math.random() - 0.5) * 2.5 : 0;
      const angleVariation = (Math.random() - 0.5) * 1.8 + sharpTurn;
      const angle = mainAngle + angleVariation;
      
      mainAngle = angle + (Math.random() - 0.5) * 0.6;
      
      const segmentLength = Math.random() < 0.3 
        ? Math.random() * 8 + 3
        : Math.random() * 30 + 10;
      
      x += Math.cos(angle) * segmentLength;
      y += Math.sin(angle) * segmentLength;

      // Создаем меньше ответвлений от этой точки (уменьшено ветвление)
      if (Math.random() < 0.08 && j > segments * 0.3 && j < segments * 0.9) {
        const branchAngle = angle + (Math.random() - 0.5) * 2.0;
        this.createBranchFromPoint(x, y, branchAngle);
      }

      // Проверяем близость к другим трещинам
      if (this.cracks.length > 0 && Math.random() < 0.15) {
        const nearestCrack = this.findNearestCrackPoint(x, y);
        if (nearestCrack && nearestCrack.distance < 100) {
          const angleToNearest = Math.atan2(nearestCrack.y - y, nearestCrack.x - x);
          const adjustedAngle = angle + (angleToNearest - angle) * 0.4;
          x += Math.cos(adjustedAngle) * segmentLength * 0.6;
          y += Math.sin(adjustedAngle) * segmentLength * 0.6;
        }
      }

      // Ограничения по границам
      if (y > this.canvas.height * 1.1 || y < -this.canvas.height * 0.1 || 
          x < -this.canvas.width * 0.1 || x > this.canvas.width * 1.1) {
        break;
      }
    }

    this.cracks.push({
      points,
      baseWidth: baseWidth,
      maxWidth: maxWidth,
      revealProgress: 0,
      revealSpeed: Math.random() * 0.003 + 0.001,
    });

    if (this.cracks.length > this.settings.crackCount) {
      this.cracks.shift();
    }
  }

  createRandomCrack() {
    // Создаем случайную трещину (используется для автоматического добавления)
    // Больше очагов - чаще создаем новые основные трещины, реже ветви
    if (this.cracks.length > 0 && Math.random() < 0.4) {
      // 40% шанс начать от существующей трещины (вместо 80%)
      this.createBranchFromExistingCrack();
    } else {
      // 60% шанс создать новый очаг (новую основную трещину)
      this.createCrackFromPoint(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        false
      );
    }
  }


  createBranchCrack() {
    // Создаем короткие ветвящиеся трещины сразу со всеми точками с динамической шириной
    const startX = Math.random() * this.canvas.width;
    const startY = Math.random() * this.canvas.height;
    const points = [];
    let x = startX;
    let y = startY;
    const segments = Math.floor(Math.random() * 18) + 10; // 10-28 сегментов
    let mainAngle = Math.random() * Math.PI * 2;
    
    const baseWidth = Math.random() * 1.0 + 0.3; // 0.3-1.3px
    const maxWidth = baseWidth * (1.3 + Math.random() * 0.7);

    for (let j = 0; j < segments; j++) {
      const progress = j / segments;
      
      const widthProgress = progress < 0.3 
        ? progress / 0.3 * 0.5
        : 0.5 + (progress - 0.3) / 0.7 * 0.5;
      const currentWidth = baseWidth + (maxWidth - baseWidth) * widthProgress;
      
      points.push({ 
        x, 
        y, 
        filled: false,
        width: Math.max(0.3, Math.min(2.5, currentWidth))
      });
      
      // Более резкие повороты
      const sharpTurn = Math.random() < 0.2 ? (Math.random() - 0.5) * 2.0 : 0;
      const angleVariation = (Math.random() - 0.5) * 1.6 + sharpTurn;
      const angle = mainAngle + angleVariation;
      mainAngle = angle + (Math.random() - 0.5) * 0.5;
      
      const length = Math.random() * 12 + 4;
      x += Math.cos(angle) * length;
      y += Math.sin(angle) * length;

      if (y > this.canvas.height * 1.1 || y < -this.canvas.height * 0.1 || 
          x < -this.canvas.width * 0.1 || x > this.canvas.width * 1.1) {
        break;
      }
    }

    this.cracks.push({
      points,
      baseWidth: baseWidth,
      maxWidth: maxWidth,
      revealProgress: 0,
      revealSpeed: Math.random() * 0.004 + 0.002, // Немного быстрее для ветвей
    });

    if (this.cracks.length > this.settings.crackCount) {
      this.cracks.shift();
    }
  }

  findNearestCrackPoint(x, y) {
    let nearest = null;
    let minDistance = Infinity;

    this.cracks.forEach(crack => {
      crack.points.forEach(point => {
        const dx = point.x - x;
        const dy = point.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { x: point.x, y: point.y, distance };
        }
      });
    });

    return nearest;
  }

  createBranchFromPoint(startX, startY, baseAngle) {
    // Создаем ветвь сразу со всеми точками с динамической шириной
    const points = [];
    let x = startX;
    let y = startY;
    const segments = Math.floor(Math.random() * 15) + 6; // 6-21 сегмент
    let angle = baseAngle;
    
    // Ветви тоньше основной трещины
    const baseWidth = Math.random() * 0.8 + 0.2; // 0.2-1.0px
    const maxWidth = baseWidth * (1.2 + Math.random() * 0.8); // Может немного расти

    for (let j = 0; j < segments; j++) {
      const progress = j / segments;
      
      // Динамическая ширина для ветвей
      const widthProgress = progress < 0.4 
        ? progress / 0.4 * 0.6  // Первые 40% - от 0 до 60% ширины
        : 0.6 + (progress - 0.4) / 0.6 * 0.4; // Остальные 60% - от 60% до 100%
      const currentWidth = baseWidth + (maxWidth - baseWidth) * widthProgress;
      
      points.push({ 
        x, 
        y, 
        filled: false,
        width: Math.max(0.2, Math.min(2, currentWidth))
      });
      
      // Более резкие повороты для ветвей
      const sharpTurn = Math.random() < 0.25 ? (Math.random() - 0.5) * 2.2 : 0;
      const angleVariation = (Math.random() - 0.5) * 1.5 + sharpTurn;
      angle = angle + angleVariation;
      
      const length = Math.random() * 10 + 3; // Короткие сегменты для ветвей
      x += Math.cos(angle) * length;
      y += Math.sin(angle) * length;

      if (y > this.canvas.height * 1.1 || y < -this.canvas.height * 0.1 || 
          x < -this.canvas.width * 0.1 || x > this.canvas.width * 1.1) {
        break;
      }
    }

    this.cracks.push({
      points,
      baseWidth: baseWidth,
      maxWidth: maxWidth,
      revealProgress: 0,
      revealSpeed: Math.random() * 0.005 + 0.003, // Быстрее для ветвей
    });

    if (this.cracks.length > this.settings.crackCount) {
      this.cracks.shift();
    }
  }

  revealCrack(crack) {
    // Постепенно увеличиваем видимость трещины
    if (crack.revealProgress >= 1) {
      return; // Трещина полностью проявилась
    }

    // Ускоряем проявление при прокрутке
    const revealBoost = 1 + this.scrollGrowthBoost * 2;
    crack.revealProgress = Math.min(1, crack.revealProgress + crack.revealSpeed * revealBoost);
  }

  animate() {
    if (!this.canvas) return;

    this.time += 0.01;
    const currentTime = Date.now();

    // Автоматическое создание трещин по времени (только если их мало)
    const baseInterval = this.settings.crackInterval;
    const randomInterval = baseInterval + (Math.random() - 0.5) * baseInterval * 0.5;
    if (currentTime - this.lastCrackTime > randomInterval) {
      if (Math.random() > 0.3 && this.cracks.length < this.settings.crackCount * 0.9) {
        this.createRandomCrack();
      }
      this.lastCrackTime = currentTime;
    }

    // Проявляем существующие трещины
    this.cracks.forEach(crack => {
      this.revealCrack(crack);
    });

    // Light gray background (slightly gray foundation)
    this.ctx.fillStyle = '#e9ecef';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw injections
    this.injections.forEach((injection, injIndex) => {
      injection.radius += injection.speed;
      injection.life -= 0.008;
      injection.maxRadius = this.settings.injectionRadius;

      // Update particles
      injection.particles.forEach(particle => {
        particle.distance += particle.speed;
      });

      // Check if injection fills cracks
      this.cracks.forEach(crack => {
        crack.points.forEach(point => {
          const dx = injection.x - point.x;
          const dy = injection.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < injection.radius) {
            point.filled = true;
          }
        });
      });

      if (injection.life <= 0 || injection.radius > injection.maxRadius) {
        this.injections.splice(injIndex, 1);
      } else {
        // Draw injection expanding - using site's blue color (#031167)
        const gradient = this.ctx.createRadialGradient(
          injection.x, injection.y, 0,
          injection.x, injection.y, injection.radius
        );
        gradient.addColorStop(0, `rgba(3, 17, 103, ${injection.life * 0.7})`);
        gradient.addColorStop(0.6, `rgba(3, 17, 103, ${injection.life * 0.5})`);
        gradient.addColorStop(1, `rgba(3, 17, 103, 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(injection.x, injection.y, injection.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw particles
        injection.particles.forEach(particle => {
          if (particle.distance < particle.maxDistance) {
            const px = injection.x + Math.cos(particle.angle) * particle.distance;
            const py = injection.y + Math.sin(particle.angle) * particle.distance;

            this.ctx.fillStyle = `rgba(3, 17, 103, ${injection.life * 0.6})`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
          }
        });
      }
    });

    // Draw cracks - dark gray to black cracks (matching photograph)
    this.cracks.forEach(crack => {
      if (!crack.points || crack.points.length === 0) return;

      // Используем revealProgress для контроля видимости
      const revealProgress = crack.revealProgress || 0;
      if (revealProgress <= 0) return; // Трещина еще не проявилась

      // Вычисляем сколько точек показывать
      const visiblePointCount = Math.floor(crack.points.length * revealProgress);
      const pointsToShow = Math.max(1, visiblePointCount);
      const visiblePoints = crack.points.slice(0, pointsToShow);

      // Рисуем трещину с динамической шириной и 3D эффектом
      for (let i = 0; i < visiblePoints.length; i++) {
        const point = visiblePoints[i];
        const dx = this.mouse.x - point.x;
        const dy = this.mouse.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let x = point.x;
        let y = point.y;

        if (distance < 100) {
          const force = (100 - distance) / 100;
          x += (dx / distance) * force * 4;
          y += (dy / distance) * force * 4;
        }

        if (i === 0) continue; // Пропускаем первую точку

        const prevPoint = visiblePoints[i - 1];
        if (point.filled && prevPoint.filled) continue; // Пропускаем заполненные части

        // Получаем ширину для текущего сегмента
        const currentWidth = point.width || crack.baseWidth || 1;
        const prevWidth = prevPoint.width || crack.baseWidth || 1;
        
        // Темные трещины с вариацией
        const darkness = 0.85 + Math.random() * 0.15;
        
        // Рисуем основной контур трещины с динамической шириной
        this.ctx.strokeStyle = `rgba(20, 20, 20, ${darkness * revealProgress})`;
        this.ctx.lineWidth = currentWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'miter'; // Острые углы для зигзагообразности
        
        // Рисуем сегмент
        this.ctx.beginPath();
        this.ctx.moveTo(prevPoint.x, prevPoint.y);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        // Добавляем 3D эффект - тень для более широких участков
        if (currentWidth > 1.2 && revealProgress > 0.2) {
          // Тень справа-внизу для эффекта глубины
          this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.4 * revealProgress})`;
          this.ctx.lineWidth = currentWidth * 0.3;
          this.ctx.globalCompositeOperation = 'multiply';
          
          const shadowOffset = currentWidth * 0.3;
          const angle = Math.atan2(y - prevPoint.y, x - prevPoint.x);
          const shadowX = Math.cos(angle + Math.PI / 2) * shadowOffset;
          const shadowY = Math.sin(angle + Math.PI / 2) * shadowOffset;
          
          this.ctx.beginPath();
          this.ctx.moveTo(prevPoint.x + shadowX, prevPoint.y + shadowY);
          this.ctx.lineTo(x + shadowX, y + shadowY);
          this.ctx.stroke();
          this.ctx.globalCompositeOperation = 'source-over';
        }
        
        // Добавляем внутреннюю подсветку для 3D эффекта (на более широких участках)
        if (currentWidth > 1.5 && revealProgress > 0.3) {
          this.ctx.strokeStyle = `rgba(60, 60, 60, ${0.3 * revealProgress})`;
          this.ctx.lineWidth = currentWidth * 0.2;
          
          const highlightOffset = -currentWidth * 0.25;
          const angle = Math.atan2(y - prevPoint.y, x - prevPoint.x);
          const highlightX = Math.cos(angle + Math.PI / 2) * highlightOffset;
          const highlightY = Math.sin(angle + Math.PI / 2) * highlightOffset;
          
          this.ctx.beginPath();
          this.ctx.moveTo(prevPoint.x + highlightX, prevPoint.y + highlightY);
          this.ctx.lineTo(x + highlightX, y + highlightY);
          this.ctx.stroke();
        }
      }

      // Draw filled parts in blue color (injection material)
      this.ctx.strokeStyle = 'rgba(3, 17, 103, 0.6)';
      this.ctx.lineWidth = crack.width * 1.5;
      this.ctx.beginPath();

      let inFilled = false;
      crack.points.forEach((point, i) => {
        if (point.filled) {
          if (!inFilled) {
            this.ctx.moveTo(point.x, point.y);
            inFilled = true;
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        } else {
          if (inFilled && i > 0 && crack.points[i - 1].filled) {
            this.ctx.stroke();
            this.ctx.beginPath();
          }
          inFilled = false;
        }
      });
      if (inFilled) {
        this.ctx.stroke();
      }
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('resize', () => this.resize());
    window.removeEventListener('scroll', () => this.handleScroll());
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.canvas.removeEventListener('click', (e) => this.handleClick(e));
      this.canvas.removeEventListener('mousedown', (e) => this.handleMouseDown(e));
      this.canvas.removeEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    // Remove document event listeners
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }
    if (this.documentMouseDownHandler) {
      document.removeEventListener('mousedown', this.documentMouseDownHandler);
    }
    if (this.documentMouseUpHandler) {
      document.removeEventListener('mouseup', this.documentMouseUpHandler);
    }
    if (this.documentMouseMoveHandler) {
      document.removeEventListener('mousemove', this.documentMouseMoveHandler);
    }
  }

  updateSetting(key, value) {
    this.settings[key] = value;

    if (key === 'crackCount') {
      while (this.cracks.length > this.settings.crackCount) {
        this.cracks.shift();
      }
    } else if (key === 'injectionRadius' || key === 'injectionSpeed') {
      this.injections.forEach(injection => {
        injection.maxRadius = this.settings.injectionRadius;
        injection.speed = this.settings.injectionSpeed;
      });
    }
  }
}

const CrackInjectionBackground = () => {
  const containerRef = useRef(null);
  const backgroundRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      backgroundRef.current = new CrackInjectionBackgroundClass(containerRef.current, {
        crackInterval: 2000,
        crackCount: 40, // Уменьшено для оптимизации производительности
        injectionRadius: 80,
        injectionSpeed: 1.5,
        scrollSensitivity: 0.7,
      });
    }

    return () => {
      if (backgroundRef.current) {
        backgroundRef.current.destroy();
      }
    };
  }, []);

  return <div ref={containerRef} className="crack-injection-background" />;
};

export default CrackInjectionBackground;
