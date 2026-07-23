(function () {
  'use strict';

  // Données des synopsis : la source de vérité, plus de HTML/JS mélangé.
  // textContent insère le texte de façon sûre (pas d'injection HTML).
  var SYNOPSIS = {
    'paquets':  { title: 'Paquets', text: "La vie réserve parfois des surprises désagréables qui s’avèrent au final plutôt avantageuses. Elle peut aussi faire surgir des opportunités à haut risque, des décisions prises dans une situation aveuglante de facilité, sous l’hypnose de la tentation la plus irrésistible ; des décisions qui vous métamorphosent en ce à quoi vos n’auriez jamais souhaité ressembler auparavant. Bruno, Vincent et Rémy vont s’engager sans filet dans des réseaux marécageux ; ils vont vendre de la drogue, par grandes quantités, ils vont s’acheminer avec une chance insolente vers leurs nouveaux rêves de gens riches, au risque d’y perdre leur amitié, leur liberté, leur vie. Mais les apparences sont trompeuses, surtout quand on approche du but en confiance, sans se poser trop de questions. Une réponse claire et amère va surgir d’une direction qu’ils ne pouvaient pas soupçonner." },
    'stade-2':  { title: 'Stade 2', text: "Il n’y a pas si longtemps, on se demandait encore si internet constituerait l’avenir du partage de la connaissance, si les progrès de la médecine continueraient à nous permettre de vivre plus vieux, si le tourisme sur la planète Mars deviendrait une réalité, si la recherche scientifique nous dévoilerait un jour tous les secrets de la matière qui constitue notre univers. Quand on constate que notre savoir se nourrit chaque jour de nouvelles découvertes faites dans les océans, dans les glaces de l’Antarctique, dans les sites de fouilles archéologiques, il nous semble toutefois important de regarder l’intérieur de notre maison autant que les horizons qui l’entourent. Jérôme Calais va se poser beaucoup de questions dans un contexte personnel qui, bien malgré lui, apportera des réponses qui sortiront de ce qui constitue le sommet indiscutable de la connaissance. Ce qu’il va entreprendre contre vents et marées conduira vers une révolution dans la manière dont nous percevons le monde, et la prouesse dont il sera l’architecte amènera la preuve du besoin essentiel d’élargir le champ de notre conscience sans jamais renoncer." },
    'station':  { title: 'Station de Recharge', text: "Pendant des siècles, la force et la cruauté ont été des méthodes efficaces pour obtenir l’assujettissement des peuples. En invoquant l’aide de Dieu ou en maudissant sa domination, l’ère industrielle a débouché sur le chemin d’un confort jamais égalé, puis sur celui des smartphones, des intelligences artificielles et du transhumanisme. En 2038, dans une France anesthésiée où se creuse le fossé entre les villes et les campagnes, Dominique est heureux de constater que la grande fraternité mondiale est enfin parvenue à se propager partout, que le genre social déborde le sexe biologique, que la voiture électrique « sauve la planète », que la bienveillance d’un pouvoir public fédéral permet à ses dirigeants d’exercer leurs compétences et à ses humbles administrés de rester prudemment à leur place. Les détenteurs du pouvoir effacent le passé, effacent Dieu, deviennent Dieu, ils déclarent que l’immortalité humaine sera la prochaine étape. Dominique vit pleinement dans ce présent dont les guerres ont changé de visage. Mais serait-il possible que l’eugénisme, la cruauté et la barbarie soient toujours tapis dans l’ombre de ces nouvelles conquêtes ?" },
    'ecole':    { title: "Quand j'étais à l'école", text: "Il attend. Le client est un gros poisson mais il tarde, sans explication… Pour ce rendez-vous, Olivier n’a pas le droit à l’erreur. C’est un business dans lequel il n’est que débutant. Le temps fait enfler le stress. Rester concentré. Pour tromper cette attente, il laisse remonter les souvenirs. L’école. L’internat des années 70, les règles, la rigueur d’un monde clos où chaque geste était observé, corrigé, sanctionné. Un monde dans lequel il fallait souvent se battre pour exister, ne pas se faire écraser. Et ce soir tout doit basculer, tout va basculer. Pour un sac plein de dollars. Du moins c’est ce qu’il espère. Il a confiance, ça va aller." }
  };

  // ============================================================
  //  PAGINATION DU LIVRE
  // ============================================================
  var book = document.getElementById('myBook');
  var container = document.getElementById('bookContainer');
  var marqueeBanner = document.getElementById('marqueeBanner');
  var leaves = Array.prototype.slice.call(book.querySelectorAll('.leaf'));
  var maxStep = leaves.length; // 1 étape par feuillet
  var currentStep = 0;
  var ZOOM_SCALE = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom-scale')) || 1.14;

  function setActiveFaces() {
    book.querySelectorAll('.page-face.is-active').forEach(function (face) {
      face.classList.remove('is-active');
    });
    var rightLeaf = leaves[currentStep];
    var leftLeaf = leaves[currentStep - 1];
    if (rightLeaf) rightLeaf.querySelector('.is-recto').classList.add('is-active');
    if (leftLeaf) leftLeaf.querySelector('.is-back').classList.add('is-active');
  }

  function goToStep(step) {
    currentStep = Math.max(0, Math.min(maxStep, step));

    leaves.forEach(function (leaf, index) {
      leaf.classList.toggle('is-flipped', currentStep > index);
    });
    setActiveFaces();

    // Recentrage : couverture seule, spread centré, ou page finale.
    // Le zoom ne s'applique qu'aux spreads intermédiaires.
    var isEndpoint = currentStep === 0 || currentStep === maxStep;
    var bookX = currentStep === 0 ? '-25%' : (currentStep === maxStep ? '25%' : '0%');
    var bookScale = isEndpoint ? 1 : ZOOM_SCALE;
    container.style.setProperty('--book-x', bookX);
    container.style.setProperty('--book-scale', bookScale);

    var isReading = currentStep > 0;
    book.classList.toggle('is-opened', isReading);
    container.classList.toggle('is-reading', isReading);
    if (marqueeBanner) {
      var wasHidden = marqueeBanner.classList.contains('is-hidden');
      marqueeBanner.classList.toggle('is-hidden', isReading);
      // À la réapparition, on relance l'animation depuis le bord droit.
      if (wasHidden && !isReading) {
        var marqueeText = marqueeBanner.querySelector('.marquee-text');
        marqueeText.style.animation = 'none';
        void marqueeText.offsetWidth; // force le reflow
        marqueeText.style.animation = '';
      }
    }

    updateNavButtons();
  }

  function nextPage() { goToStep(currentStep + 1); }
  function prevPage() { goToStep(currentStep - 1); }

  function updateNavButtons() {
    // display:none plutôt que visibility:hidden : le bouton caché est
    // retiré du flux, donc le bouton visible reste seul et parfaitement
    // centré dans .controls (qui occupe toute la largeur et justifie
    // son contenu au centre).
    document.getElementById('btnPrev').style.display = currentStep === 0 ? 'none' : '';
    document.getElementById('btnNext').style.display = currentStep === maxStep ? 'none' : '';
  }

  // ============================================================
  //  MODALE SYNOPSIS
  // ============================================================
  var overlay = document.getElementById('synopsisOverlay');
  var titleEl = document.getElementById('synopsisTitle');
  var textEl = document.getElementById('synopsisText');
  var closeBtn = document.getElementById('synopsisClose');
  var lastFocused = null;

  function openSynopsis(key) {
    var data = SYNOPSIS[key];
    if (!data) return;
    titleEl.textContent = data.title;
    textEl.textContent = data.text;
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    lastFocused = document.activeElement;
    closeBtn.focus();
  }

  function closeSynopsis() {
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // ============================================================
  //  MODALE MENTIONS LÉGALES
  // ============================================================
  var legalOverlay = document.getElementById('legalOverlay');
  var legalClose = document.getElementById('legalClose');
  var legalLastFocused = null;

  function openLegal() {
    legalOverlay.classList.add('is-active');
    legalOverlay.setAttribute('aria-hidden', 'false');
    legalLastFocused = document.activeElement;
    legalClose.focus();
  }

  function closeLegal() {
    legalOverlay.classList.remove('is-active');
    legalOverlay.setAttribute('aria-hidden', 'true');
    if (legalLastFocused && typeof legalLastFocused.focus === 'function') legalLastFocused.focus();
  }

  // ============================================================
  //  MODALE CONTACT
  // ============================================================
  var contactOverlay = document.getElementById('contactOverlay');
  var contactClose = document.getElementById('contactClose');
  var contactLastFocused = null;

  function openContact() {
    contactOverlay.classList.add('is-active');
    contactOverlay.setAttribute('aria-hidden', 'false');
    contactLastFocused = document.activeElement;
    contactClose.focus();
  }

  function closeContact() {
    contactOverlay.classList.remove('is-active');
    contactOverlay.setAttribute('aria-hidden', 'true');
    if (contactLastFocused && typeof contactLastFocused.focus === 'function') contactLastFocused.focus();
  }

  // ============================================================
  //  ÉCOUTEURS — délégation, zéro attribut onclick dans le HTML
  // ============================================================
  document.addEventListener('click', function (e) {
    // Bouton synopsis
    var trigger = e.target.closest('.synopsis-trigger');
    if (trigger) { openSynopsis(trigger.getAttribute('data-synopsis')); return; }

    // Couverture cliquable
    if (e.target.closest('[data-action="open-book"]')) { goToStep(1); return; }

    // Ouverture des mentions légales
    if (e.target.closest('[data-action="open-legal"]')) { e.preventDefault(); openLegal(); return; }

    // Ouverture du contact
    if (e.target.closest('[data-action="open-contact"]')) { e.preventDefault(); openContact(); return; }

    // Clic sur le fond sombre de la modale synopsis = fermeture
    if (e.target === overlay) { closeSynopsis(); return; }

    // Clic sur le fond sombre de la modale légale = fermeture
    if (e.target === legalOverlay) { closeLegal(); return; }

    // Clic sur le fond sombre de la modale contact = fermeture
    if (e.target === contactOverlay) { closeContact(); return; }
  });

  // Couverture : Entrée / Espace déclenchent l'ouverture (accessibilité clavier)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (overlay.classList.contains('is-active')) { closeSynopsis(); return; }
      if (legalOverlay.classList.contains('is-active')) { closeLegal(); return; }
      if (contactOverlay.classList.contains('is-active')) { closeContact(); return; }
    }
    var target = e.target.closest && e.target.closest('[data-action="open-book"]');
    if (target && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      goToStep(1);
    }
  });

  document.getElementById('btnPrev').addEventListener('click', prevPage);
  document.getElementById('btnNext').addEventListener('click', nextPage);
  closeBtn.addEventListener('click', closeSynopsis);
  legalClose.addEventListener('click', closeLegal);
  contactClose.addEventListener('click', closeContact);

  // Piège à focus basique à l'intérieur de la modale synopsis (Tab / Maj+Tab)
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === closeBtn) {
      e.preventDefault(); closeBtn.focus();
    }
  });

  // Piège à focus basique à l'intérieur de la modale légale (Tab / Maj+Tab)
  legalOverlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === legalClose) {
      e.preventDefault(); legalClose.focus();
    }
  });

  // Piège à focus basique à l'intérieur de la modale contact (Tab / Maj+Tab)
  contactOverlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === contactClose) {
      e.preventDefault(); contactClose.focus();
    }
  });

  // ============================================================
  //  ADRESSE E-MAIL RECONSTITUÉE (anti-scraping)
  //  On évite d'écrire l'adresse en clair dans le HTML : elle est
  //  reconstituée ici et injectée au chargement, ce qui la rend
  //  invisible aux robots qui ne lisent que le HTML brut.
  // ============================================================
  var emailUser = 'lionel.daucourt';
  var emailHost = 'mac.com';
  var contactLink = document.getElementById('contactEmailLink');
  if (contactLink) {
    var fullEmail = emailUser + '@' + emailHost;
    contactLink.href = 'mailto:' + fullEmail;
    contactLink.textContent = fullEmail;
  }

  goToStep(0); // état initial : livre fermé
})();