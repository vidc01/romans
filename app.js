(function () {
  'use strict';

  // Données des synopsis : la source de vérité, plus de HTML/JS mélangé.
  // textContent insère le texte de façon sûre (pas d'injection HTML).
  var SYNOPSIS = {
    'paquets':  { title: 'Paquets', text: "Après quinze ans d'absence, Anne revient dans le village breton où elle a grandi, pressée par la vente de la maison familiale. Entre les effluves d'iode et les silences pesants de ses proches, elle rouvre des cartons scellés depuis son départ — des paquets jamais ouverts, gardiens de vérités que sa mère avait choisi de taire. Au fil des marées et des confidences arrachées, Anne comprend que revenir n'est jamais tout à fait rentrer, et que certains secrets, une fois déballés, changent le sens de toute une vie." },
    'stade-2':  { title: 'Stade 2', text: "Trois femmes, trois générations, une même maison où les non-dits se transmettent comme un héritage. Quand la benjamine découvre un carnet oublié dans le grenier, c'est tout un mur de silence familial qui commence à se fissurer. Entre la grand-mère qui refuse de se souvenir, la mère qui a fait de l'oubli une discipline, et la petite-fille qui veut enfin comprendre, Stade 2 raconte comment un secret peut traverser les décennies sans jamais perdre sa force de destruction — jusqu'à ce qu'on décide, enfin, de le regarder en face." },
    'station':  { title: 'Station de Recharge', text: "Six personnes se retrouvent bloquées dans un refuge isolé au sommet des Alpes, coupées du monde par une tempête qui ne faiblit pas. Ce qui devait être une simple halte technique — le temps de recharger les batteries d'un convoi — se transforme en huis clos sous tension, où chaque regard, chaque silence, devient suspect. Station de Recharge est un thriller psychologique où la montagne, aussi belle qu'hostile, devient le théâtre d'une lente mise à nu des masques que chacun porte." },
    'ecole':    { title: "Quand j'étais à l'école", text: "Entre les souvenirs d'une salle de classe d'autrefois et le présent d'un narrateur en quête de racines, ce roman tisse le récit d'un déracinement et d'une reconstruction. À travers les visages d'enfants devenus adultes, dispersés aux quatre coins du monde, l'auteur interroge ce que l'école laisse en nous bien après qu'on l'a quittée : la mémoire d'un lieu, d'une langue, d'une communauté disparue — et la beauté fragile de tout recommencer ailleurs." }
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

    // Clic sur le fond sombre de la modale synopsis = fermeture
    if (e.target === overlay) { closeSynopsis(); return; }

    // Clic sur le fond sombre de la modale légale = fermeture
    if (e.target === legalOverlay) { closeLegal(); return; }
  });

  // Couverture : Entrée / Espace déclenchent l'ouverture (accessibilité clavier)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (overlay.classList.contains('is-active')) { closeSynopsis(); return; }
      if (legalOverlay.classList.contains('is-active')) { closeLegal(); return; }
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

  goToStep(0); // état initial : livre fermé
})();
