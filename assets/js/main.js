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
  function initMedia() {
    $$('.media img').forEach(function (img) {
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
     Project gallery filter.
     ------------------------------------------------------------------ */
  function initFilters() {
    var bar = $('[data-filter-bar]');
    var grid = $('[data-filter-grid]');
    if (!bar || !grid) return;

    var buttons = $$('[data-filter]', bar);
    var cards = $$('[data-category]', grid);
    var empty = $('[data-filter-empty]');

    var apply = function (key) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = key === 'all' || card.getAttribute('data-category') === key;
        if (match) shown++;
        card.style.display = match ? '' : 'none';
        card.classList.toggle('is-visible', match);
        if (match && !reduceMotion) {
          card.style.animation = 'none';
          // reflow so the animation can restart
          void card.offsetWidth;
          card.style.animation = 'stepIn 0.5s var(--ease) both';
        }
      });
      if (empty) empty.hidden = shown !== 0;
    };

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        apply(btn.getAttribute('data-filter'));
      });
    });
  }

  /* ------------------------------------------------------------------
     Editorial service list — the sticky panel follows the hovered row.
     ------------------------------------------------------------------ */
  function initServiceList() {
    var list = $('[data-svc-list]');
    if (!list) return;

    var rows = $$('[data-svc]', list);
    var panels = $$('[data-svc-img]');
    if (!rows.length || !panels.length) return;

    var activate = function (index) {
      rows.forEach(function (row) {
        row.classList.toggle('is-active', row.getAttribute('data-svc') === index);
      });
      panels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-svc-img') === index);
      });
    };

    rows.forEach(function (row) {
      var index = row.getAttribute('data-svc');
      row.addEventListener('mouseenter', function () { activate(index); });
      row.addEventListener('focus', function () { activate(index); });
    });

    activate(rows[0].getAttribute('data-svc'));
  }

  /* ------------------------------------------------------------------
     Eligibility wizard — 3 questions, then an indicative estimate.
     Purely client-side; no data leaves the page.
     ------------------------------------------------------------------ */
  var ESTIMATES = {
    toiture: { label: 'Rénovation de toiture', low: 9500, high: 24000, weeks: '2 à 4 semaines' },
    facade: { label: 'Façade & isolation', low: 12000, high: 32000, weeks: '3 à 6 semaines' },
    jardin: { label: 'Aménagement extérieur', low: 6500, high: 21000, weeks: '2 à 5 semaines' },
    interieur: { label: 'Rénovation intérieure', low: 15000, high: 48000, weeks: '5 à 12 semaines' }
  };

  var PREMIUM_ADJUST = { maison: 1, appartement: 0.75, immeuble: 1.65, commerce: 1.3 };
  var AGE_ADJUST = { 'avant-1945': 1.25, '1945-1990': 1.1, 'apres-1990': 1 };

  var STORE_KEY = 'haumont:estimation';

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

    var formatEuro = function (n) {
      return new Intl.NumberFormat('fr-BE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(Math.round(n / 100) * 100);
    };

    var showResult = function () {
      var base = ESTIMATES[answers.projet] || ESTIMATES.toiture;
      var factor = (PREMIUM_ADJUST[answers.bien] || 1) * (AGE_ADJUST[answers.age] || 1);

      var setText = function (sel, value) {
        var el = $(sel, wizard);
        if (el) el.textContent = value;
      };

      setText('[data-result-scope]', base.label);
      setText('[data-result-range]', formatEuro(base.low * factor) + ' – ' + formatEuro(base.high * factor));
      setText('[data-result-duration]', base.weeks);

      // Belgian renovation VAT: 6 % on homes over 10 years old, 21 % otherwise.
      var reduced = answers.age !== 'apres-1990';
      setText('[data-result-tva]', reduced ? 'TVA 6 % applicable' : 'TVA 21 % applicable');
      setText(
        '[data-result-tva-note]',
        reduced
          ? 'Votre bien a plus de 10 ans : le taux réduit de 6 % s’applique à la main-d’œuvre et aux matériaux fournis.'
          : 'Bien de moins de 10 ans : le taux standard de 21 % s’applique. Nous vérifions votre situation exacte lors de la visite.'
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

      // Hand the answers to the quote form so nothing has to be re-typed.
      try {
        window.sessionStorage.setItem(STORE_KEY, JSON.stringify({
          projet: answers.projet,
          label: base.label,
          summary: summary ? summary.textContent : '',
          range: $('[data-result-range]', wizard).textContent
        }));
      } catch (err) {
        /* private browsing — the handoff is a bonus, never a requirement */
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

    field.value = [data.label, data.summary, data.range].filter(Boolean).join(' · ');

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
      note.textContent = 'Votre estimation a été reprise : ' +
        [data.label, data.range].filter(Boolean).join(' — ') +
        '. Complétez le formulaire pour recevoir le devis détaillé.';
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
    initMedia();
    initNav();
    initReveal();
    initCounters();
    initParallax();
    initAccordion();
    initFilters();
    initServiceList();
    initWizard();
    initQuoteHandoff();
    initForms();
    initYear();
  });
})();
