/* ==========================================================================
   Haumont Rénovation SRL — interactions
   Vanilla ES2015+. Every module is optional: a page only pays for what it uses.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------------------
     Images — fade in when decoded, fall back to the gradient plate.
     ------------------------------------------------------------------ */
  function initLogo() {
    $$('[data-logo]').forEach(function (img) {
      var fail = function () {
        img.style.display = 'none';
        // Le nom écrit prend le relais du logo absent.
        var fallback = img.parentNode && img.parentNode.querySelector('.sr-only-fallback');
        if (fallback) fallback.hidden = false;
      };
      if (img.complete) {
        if (!img.naturalWidth) fail();
        return;
      }
      img.addEventListener('error', fail, { once: true });
    });
  }

  function initMedia() {
    $$('.media img').forEach(function (img) {
      // Une <img> sans source n'a rien échoué : elle attend la sienne.
      if (!img.getAttribute('src')) return;

      var reveal = function () { img.classList.add('is-loaded'); };
      var fail = function () { img.classList.add('is-failed'); };

      if (img.complete) {
        // naturalWidth is 0 for images that errored before this script ran.
        img.naturalWidth ? reveal() : fail();
        return;
      }
      img.addEventListener('load', reveal, { once: true });
      img.addEventListener('error', fail, { once: true });
    });
  }

  /* ------------------------------------------------------------------
     Navigation — frosted state on scroll, mobile panel, current page.
     ------------------------------------------------------------------ */
  function initNav() {
    var nav = $('[data-nav]');
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var burger = $('[data-burger]');
    var panel = $('[data-mobile-panel]');
    if (!burger || !panel) return;

    var setOpen = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    $$('a', panel).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal — staggered by [data-reveal-stagger] on a parent.
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    $$('[data-reveal-stagger]').forEach(function (group) {
      var step = parseInt(group.getAttribute('data-reveal-stagger'), 10) || 90;
      $$('[data-reveal]', group).forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', i * step + 'ms');
      });
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Titres révélés ligne par ligne.

     Le texte est découpé en mots, la mise en page décide où tombent les
     lignes, puis chaque ligne est réenveloppée dans un masque. Le découpage
     est refait si la largeur change, les lignes n'étant plus les mêmes.
     ------------------------------------------------------------------ */
  function initSplit() {
    var targets = $$('[data-split]');
    if (!targets.length) return;

    if (reduceMotion) {
      targets.forEach(function (el) { el.classList.add('is-split-in'); });
      return;
    }

    var STEP = 90; // décalage entre deux lignes

    var wrapWords = function (root) {
      var texts = [];
      var collect = function (node) {
        for (var i = 0; i < node.childNodes.length; i++) {
          var child = node.childNodes[i];
          if (child.nodeType === 3) texts.push(child);
          else if (child.nodeType === 1 && child.tagName !== 'BR') collect(child);
        }
      };
      collect(root);

      texts.forEach(function (textNode) {
        var parts = textNode.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          var word = document.createElement('span');
          word.className = 'split-w';
          word.textContent = part;
          frag.appendChild(word);
        });
        textNode.parentNode.replaceChild(frag, textNode);
      });
    };

    var split = function (el) {
      if (el._splitSrc == null) el._splitSrc = el.innerHTML;
      el.innerHTML = el._splitSrc;

      var before = el.textContent;
      wrapWords(el);

      // Après découpage, le titre ne doit contenir que des mots, des espaces
      // et des <br>. Toute autre balise (un <span> stylé, par exemple) rendrait
      // le regroupement en lignes hasardeux : on renonce proprement.
      var flat = Array.prototype.slice.call(el.childNodes);
      var simple = flat.every(function (n) {
        return n.nodeType === 3 ||
          (n.nodeType === 1 && (n.tagName === 'BR' ||
            (n.classList && n.classList.contains('split-w'))));
      });
      if (!simple) {
        el.innerHTML = el._splitSrc;
        el.classList.add('is-split-in');
        return false;
      }

      // Regroupement par position verticale : c'est la mise en page qui tranche.
      var lines = [];
      var current = null;
      var lastTop = null;
      flat.forEach(function (node) {
        if (node.nodeType === 1 && node.classList && node.classList.contains('split-w')) {
          var top = Math.round(node.getBoundingClientRect().top);
          if (current === null || Math.abs(top - lastTop) > 2) {
            current = [];
            lines.push(current);
            lastTop = top;
          }
          current.push(node);
        } else if (node.nodeType === 3 && current) {
          current.push(node);
        }
        // Les <br> disparaissent : la coupure devient structurelle.
      });

      if (!lines.length) {
        el.innerHTML = el._splitSrc;
        el.classList.add('is-split-in');
        return false;
      }

      var base = parseInt(el.getAttribute('data-split-delay'), 10) || 0;
      var frag = document.createDocumentFragment();
      lines.forEach(function (nodes, i) {
        var mask = document.createElement('span');
        mask.className = 'split-line';
        var inner = document.createElement('span');
        inner.style.setProperty('--line-delay', (base + i * STEP) + 'ms');
        nodes.forEach(function (n) { inner.appendChild(n); });
        // La coupure était un <br> : sans cet espace, « carrelage,au » serait
        // collé à la copie du texte comme pour un lecteur d'écran.
        if (i < lines.length - 1) inner.appendChild(document.createTextNode(' '));
        mask.appendChild(inner);
        frag.appendChild(mask);
      });

      el.innerHTML = '';
      el.appendChild(frag);

      // Filet de sécurité : les caractères doivent être identiques. L'espacement
      // est ignoré, puisque le découpage en ajoute volontairement en fin de ligne.
      var norm = function (t) { return t.replace(/\s+/g, ''); };
      if (norm(el.textContent) !== norm(before)) {
        el.innerHTML = el._splitSrc;
        el.classList.add('is-split-in');
        return false;
      }
      return true;
    };

    var prepare = function () {
      targets.forEach(function (el) {
        // Une entrée de hero pilotée par CSS ferait doublon avec les lignes :
        // on reprend son délai et on la désactive.
        if (el.hasAttribute('data-intro')) {
          var delay = parseInt(el.style.getPropertyValue('--intro-delay'), 10) || 0;
          el.setAttribute('data-split-delay', String(delay));
          el.removeAttribute('data-intro');
        }
        el._splitOk = split(el);
      });
    };

    prepare();

    // Les lignes tombent ailleurs une fois la police chargée.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        targets.forEach(function (el) {
          if (!el._splitOk) return;
          var wasIn = el.classList.contains('is-split-in');
          el.classList.remove('is-split-in');
          el._splitOk = split(el);
          if (wasIn) {
            void el.offsetWidth;
            el.classList.add('is-split-in');
          }
        });
      });
    }

    var reveal = function (el) { el.classList.add('is-split-in'); };

    if (!('IntersectionObserver' in window)) {
      targets.forEach(reveal);
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

      targets.forEach(function (el) {
        // Un titre déjà à l'écran au chargement n'attend pas le défilement.
        if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
        else io.observe(el);
      });
    }

    var lastWidth = window.innerWidth;
    var timer = null;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) return; // le clavier mobile ne compte pas
      lastWidth = window.innerWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        targets.forEach(function (el) {
          if (!el._splitOk) return;
          var wasIn = el.classList.contains('is-split-in');
          el.classList.remove('is-split-in');
          el._splitOk = split(el);
          if (wasIn) {
            void el.offsetWidth;
            el.classList.add('is-split-in');
          }
        });
      }, 220);
    });
  }

  /* ------------------------------------------------------------------
     Count-up statistics.
     ------------------------------------------------------------------ */
  function initCounters() {
    var counters = $$('[data-count]');
    if (!counters.length) return;

    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
      var duration = parseInt(el.getAttribute('data-duration'), 10) || 1600;

      if (reduceMotion) {
        el.textContent = target.toFixed(decimals);
        return;
      }

      var start = null;
      var tick = function (now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        // easeOutExpo
        var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Parallax — subtle vertical drift, rAF-throttled.
     ------------------------------------------------------------------ */
  function initParallax() {
    var layers = $$('[data-parallax]');
    if (!layers.length || reduceMotion) return;

    var ticking = false;

    var update = function () {
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        // -1 → element entering from below, 1 → leaving at the top
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        el.style.transform = 'translate3d(0,' + (progress * speed * 100).toFixed(2) + 'px,0)';
      });
      ticking = false;
    };

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     Accordion (FAQ).
     ------------------------------------------------------------------ */
  function initAccordion() {
    $$('[data-accordion]').forEach(function (group) {
      var items = $$('.acc-item', group);
      items.forEach(function (item) {
        var trigger = $('[data-acc-trigger]', item);
        if (!trigger) return;
        trigger.addEventListener('click', function () {
          var willOpen = !item.classList.contains('is-open');
          items.forEach(function (other) {
            other.classList.remove('is-open');
            var t = $('[data-acc-trigger]', other);
            if (t) t.setAttribute('aria-expanded', 'false');
          });
          item.classList.toggle('is-open', willOpen);
          trigger.setAttribute('aria-expanded', String(willOpen));
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Galerie des réalisations — construite à partir de window.PROJETS
     (assets/js/projets.js). Filtres et visionneuse compris.
     ------------------------------------------------------------------ */
  var METIERS = {
    carrelage: 'Carrelage & salle de bain',
    maconnerie: 'Maçonnerie',
    toiture: 'Toiture plate',
    menuiserie: 'Menuiserie'
  };

  function buildFilters(bar, grid, entries, esc) {
    if (!bar) return;

    var presents = [];
    entries.forEach(function (e) {
      if (e.metier && presents.indexOf(e.metier) === -1) presents.push(e.metier);
    });

    // Un seul métier : le filtre n'aurait rien à trier.
    if (presents.length < 2) return;

    bar.hidden = false;
    bar.innerHTML = '<button type="button" class="opt w-auto justify-center px-5 py-2.5 text-sm" ' +
        'data-filter="all" aria-pressed="true">Tout</button>' +
      presents.map(function (m) {
        return '<button type="button" class="opt w-auto justify-center px-5 py-2.5 text-sm" ' +
          'data-filter="' + esc(m) + '" aria-pressed="false">' + esc(METIERS[m] || m) + '</button>';
      }).join('');

    var buttons = $$('[data-filter]', bar);
    var cards = $$('[data-category]', grid);

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-filter');
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        cards.forEach(function (card) {
          var match = key === 'all' || card.getAttribute('data-category') === key;
          card.style.display = match ? '' : 'none';
          if (match && !reduceMotion) {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = 'stepIn 0.5s var(--ease) both';
          }
        });
      });
    });
  }

  function initGallery() {
    var grid = $('[data-gallery-grid]');
    if (!grid) return;

    var esc = function (str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    var projets = (window.PROJETS || []).filter(function (p) {
      return p && p.images && p.images.length;
    });
    var photos = (window.PHOTOS || []).filter(function (p) { return p && p.src; });

    var empty = $('[data-gallery-empty]');
    var bar = $('[data-gallery-filters]');

    // Aucun contenu : la page garde son message d'attente.
    if (!projets.length && !photos.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    // ── Mode mosaïque : des photos, sans chantier détaillé ──────────
    if (!projets.length) {
      grid.className = 'grid grid-cols-2 gap-4 md:grid-cols-3';
      grid.innerHTML = photos.map(function (photo, i) {
        return '' +
          '<button type="button" class="panel group block overflow-hidden p-0" data-category="' + esc(photo.metier) + '" ' +
              'data-open-projet="0" data-open-photo="' + i + '" ' +
              'aria-label="Agrandir : ' + esc(photo.legende || 'photo ' + (i + 1)) + '">' +
            '<figure class="media media-zoom aspect-square w-full">' +
              '<img src="' + esc(photo.src) + '" alt="' + esc(photo.alt || photo.legende || 'Chantier réalisé par Haumont Rénovation') + '" ' +
                   'loading="lazy" decoding="async">' +
              '<div class="scrim-card absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>' +
              (photo.legende
                ? '<figcaption class="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-left text-sm font-light text-white opacity-0 ' +
                  'transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">' + esc(photo.legende) + '</figcaption>'
                : '') +
            '</figure>' +
          '</button>';
      }).join('');

      buildFilters(bar, grid, photos, esc);
      initMedia();
      // La visionneuse traite la mosaïque comme un chantier unique.
      initLightbox([{ titre: '', images: photos }], esc);
      return;
    }

    // ── Mode chantiers détaillés ────────────────────────────────────
    grid.className = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3';
    grid.innerHTML = projets.map(function (p, i) {
      var first = p.images[0];
      var label = METIERS[p.metier] || 'Chantier';
      var meta = [p.lieu, p.annee].filter(Boolean).join(' · ');
      return '' +
        '<article class="panel group overflow-hidden" data-category="' + esc(p.metier) + '" data-reveal>' +
          '<button type="button" class="block w-full text-left" data-open-projet="' + i + '">' +
            '<figure class="media media-zoom aspect-[5/4] w-full">' +
              '<img src="' + esc(first.src) + '" alt="' + esc(first.alt || p.titre) + '" loading="lazy" decoding="async">' +
              '<div class="scrim-card absolute inset-0 opacity-70"></div>' +
              '<span class="chip absolute left-5 top-5 bg-ink-950/60 backdrop-blur">' + esc(label) + '</span>' +
              (p.images.length > 1
                ? '<span class="chip absolute right-5 top-5 bg-ink-950/60 backdrop-blur">' + p.images.length + ' photos</span>'
                : '') +
            '</figure>' +
            '<div class="p-7">' +
              '<div class="flex items-baseline justify-between gap-4">' +
                '<h3 class="text-lg font-normal tracking-tight text-white">' + esc(p.titre) + '</h3>' +
                '<span class="text-xs font-light text-silver-600">' + esc(meta) + '</span>' +
              '</div>' +
              (p.description ? '<p class="lede mt-3 text-sm">' + esc(p.description) + '</p>' : '') +
            '</div>' +
          '</button>' +
        '</article>';
    }).join('');

    buildFilters(bar, grid, projets, esc);

    initReveal();
    initMedia();
    initLightbox(projets, esc);
  }

  /* ------------------------------------------------------------------
     Visionneuse — parcourt les photos d'un chantier (avant / après / détail).
     ------------------------------------------------------------------ */
  function initLightbox(projets, esc) {
    var box = $('[data-lightbox]');
    if (!box) return;

    var imgEl = $('[data-lb-img]', box);
    var capEl = $('[data-lb-caption]', box);
    var titleEl = $('[data-lb-title]', box);
    var countEl = $('[data-lb-count]', box);
    var prevBtn = $('[data-lb-prev]', box);
    var nextBtn = $('[data-lb-next]', box);
    var closeBtn = $('[data-lb-close]', box);

    var projet = null;
    var idx = 0;
    var lastFocus = null;

    var paint = function () {
      var photo = projet.images[idx];
      imgEl.classList.remove('is-failed');
      imgEl.classList.add('is-loaded');
      imgEl.src = photo.src;
      imgEl.alt = photo.alt || projet.titre;
      titleEl.textContent = projet.titre || '';
      capEl.textContent = [photo.legende, projet.lieu, projet.annee].filter(Boolean).join(' · ');
      countEl.textContent = (idx + 1) + ' / ' + projet.images.length;
      var solo = projet.images.length < 2;
      prevBtn.hidden = solo;
      nextBtn.hidden = solo;
    };

    var open = function (i, trigger, startPhoto) {
      projet = projets[i];
      if (!projet) return;
      idx = startPhoto || 0;
      lastFocus = trigger || null;
      paint();
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    var close = function () {
      box.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    var step = function (delta) {
      idx = (idx + delta + projet.images.length) % projet.images.length;
      paint();
    };

    $$('[data-open-projet]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        open(parseInt(btn.getAttribute('data-open-projet'), 10), btn,
             parseInt(btn.getAttribute('data-open-photo'), 10) || 0);
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  var TRAVAUX = {
    carrelage: 'Carrelage & salle de bain',
    maconnerie: 'Maçonnerie',
    toiture: 'Toiture plate',
    menuiserie: 'Menuiserie'
  };

  var STORE_KEY = 'haumont:projet';

  function initWizard() {
    var wizard = $('[data-wizard]');
    if (!wizard) return;

    var steps = $$('[data-step]', wizard);
    var bar = $('[data-progress]', wizard);
    var counter = $('[data-step-counter]', wizard);
    var backBtn = $('[data-wizard-back]', wizard);
    var restartBtn = $('[data-wizard-restart]', wizard);
    var answers = {};
    var index = 0;

    var questionCount = steps.filter(function (s) {
      return s.getAttribute('data-step') !== 'result';
    }).length;

    var render = function () {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === index); });
      if (bar) bar.style.width = Math.round((index / questionCount) * 100) + '%';
      if (counter) {
        counter.textContent = index < questionCount
          ? 'Étape ' + (index + 1) + ' / ' + questionCount
          : 'Résultat';
      }
      if (backBtn) backBtn.hidden = index === 0 || index >= questionCount;
    };

    var showResult = function () {
      var label = TRAVAUX[answers.projet] || 'Travaux';

      var setText = function (sel, value) {
        var el = $(sel, wizard);
        if (el) el.textContent = value;
      };

      setText('[data-result-scope]', label);

      // TVA belge sur la rénovation : 6 % pour un logement de plus de dix ans,
      // 21 % sinon. C'est une règle légale, pas une estimation.
      var reduced = answers.age !== 'apres-1990';
      setText('[data-result-tva]', reduced ? 'TVA 6 %' : 'TVA 21 %');
      setText(
        '[data-result-tva-note]',
        reduced
          ? 'Votre bien a plus de dix ans et sert de logement privé : le taux réduit de 6 % s’applique à la main-d’œuvre comme aux matériaux que je fournis.'
          : 'Bien de moins de dix ans : le taux standard de 21 % s’applique. Je vérifie votre situation exacte lors de la visite.'
      );

      var summary = $('[data-result-summary]', wizard);
      if (summary) {
        summary.textContent = [
          $('[data-label-bien="' + answers.bien + '"]', wizard),
          $('[data-label-age="' + answers.age + '"]', wizard)
        ].filter(Boolean).map(function (el) {
          return el.textContent.replace(/\s+/g, ' ').trim();
        }).join(' · ');
      }

      // Transmet le contexte au formulaire de devis.
      try {
        window.sessionStorage.setItem(STORE_KEY, JSON.stringify({
          projet: answers.projet,
          label: label,
          summary: summary ? summary.textContent : '',
          tva: reduced ? 'TVA 6 %' : 'TVA 21 %'
        }));
      } catch (err) {
        /* navigation privée — la reprise est un bonus, jamais un prérequis */
      }

      index = questionCount;
      render();
    };

    $$('[data-answer]', wizard).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-answer');
        var value = btn.getAttribute('data-value');
        answers[key] = value;

        var siblings = $$('[data-answer="' + key + '"]', wizard);
        siblings.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');

        window.setTimeout(function () {
          if (index < questionCount - 1) {
            index++;
            render();
          } else {
            showResult();
          }
        }, reduceMotion ? 0 : 260);
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (index > 0) { index--; render(); }
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        answers = {};
        index = 0;
        $$('[data-answer]', wizard).forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
        });
        render();
      });
    }

    render();
  }

  /* ------------------------------------------------------------------
     Quote handoff — picks up an estimate made on the home page.
     ------------------------------------------------------------------ */
  function initQuoteHandoff() {
    var field = $('[data-quote-context]');
    if (!field) return;

    var raw;
    try {
      raw = window.sessionStorage.getItem(STORE_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;

    var data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return;
    }

    field.value = [data.label, data.summary, data.tva].filter(Boolean).join(' · ');

    var select = $('#projet');
    if (select && data.projet) {
      var match = Array.prototype.some.call(select.options, function (o) {
        return o.value === data.projet;
      });
      if (match) select.value = data.projet;
    }

    var note = $('[data-quote-note]');
    if (note) {
      note.hidden = false;
      note.classList.remove('hidden');
      note.textContent = 'Reprise de votre simulation : ' +
        [data.label, data.tva].filter(Boolean).join(' — ') +
        '. Complétez le formulaire pour recevoir votre devis.';
    }
  }

  /* ------------------------------------------------------------------
     Form validation + simulated submission.
     ------------------------------------------------------------------ */
  function initForms() {
    $$('[data-form]').forEach(function (form) {
      var status = $('[data-form-status]', form);
      var submit = $('[data-form-submit]', form);

      var validators = {
        nom: function (v) { return v.trim().length >= 2 || 'Merci d’indiquer votre nom.'; },
        email: function (v) {
          return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) || 'Adresse e-mail invalide.';
        },
        telephone: function (v) {
          var digits = v.replace(/[^\d+]/g, '');
          return digits.length === 0 || digits.length >= 9 || 'Numéro de téléphone incomplet.';
        },
        codepostal: function (v) {
          return /^\d{4}$/.test(v.trim()) || 'Code postal belge à 4 chiffres.';
        },
        projet: function (v) { return v !== '' || 'Sélectionnez un type de projet.'; },
        message: function (v) {
          return v.trim().length >= 12 || 'Décrivez votre projet en quelques mots.';
        },
        rgpd: function (_, field) { return field.checked || 'Votre accord est nécessaire.'; }
      };

      var validateField = function (field) {
        var rule = validators[field.name];
        if (!rule) return true;
        var result = rule(field.value, field);
        var errorEl = form.querySelector('[data-error-for="' + field.name + '"]');
        var ok = result === true;
        field.setAttribute('aria-invalid', String(!ok));
        if (errorEl) errorEl.textContent = ok ? '' : result;
        return ok;
      };

      $$('input, select, textarea', form).forEach(function (field) {
        field.addEventListener('blur', function () { validateField(field); });
        field.addEventListener('input', function () {
          if (field.getAttribute('aria-invalid') === 'true') validateField(field);
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var fields = $$('input, select, textarea', form).filter(function (f) {
          return validators[f.name];
        });
        var firstInvalid = null;
        fields.forEach(function (f) {
          if (!validateField(f) && !firstInvalid) firstInvalid = f;
        });

        if (firstInvalid) {
          firstInvalid.focus();
          if (status) {
            status.hidden = false;
            status.className = 'mt-6 text-sm text-[#db8278]';
            status.textContent = 'Merci de corriger les champs signalés.';
          }
          return;
        }

        if (submit) {
          submit.disabled = true;
          submit.dataset.label = submit.textContent;
          submit.textContent = 'Envoi en cours…';
        }

        // Static site: no backend. Swap this block for a real POST when the
        // form endpoint is available.
        window.setTimeout(function () {
          form.reset();
          if (submit) {
            submit.disabled = false;
            submit.textContent = submit.dataset.label || 'Envoyer';
          }
          if (status) {
            status.hidden = false;
            status.className = 'mt-6 text-sm text-sage-300';
            status.textContent =
              'Merci. Votre demande est enregistrée — nous revenons vers vous sous 24 h ouvrables.';
          }
        }, 900);
      });
    });
  }

  /* ------------------------------------------------------------------
     Misc.
     ------------------------------------------------------------------ */
  function initYear() {
    $$('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLogo();
    initMedia();
    initNav();
    initReveal();
    initSplit();
    initCounters();
    initParallax();
    initAccordion();
    initGallery();
    initWizard();
    initQuoteHandoff();
    initForms();
    initYear();
  });
})();
