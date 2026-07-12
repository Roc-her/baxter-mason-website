(function () {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  function ease(t) { return 1 - Math.pow(1 - t, 4); }
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, to = +el.dataset.to, dur = 1500, s = null;
      function step(ts) {
        if (!s) s = ts;
        var p = Math.min((ts - s) / dur, 1);
        el.textContent = Math.round(ease(p) * to).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.ct').forEach(function (el) { cio.observe(el); });

  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('stuck', window.scrollY > 20);
    }, { passive: true });
  }

  function normalizePage(pathname) {
    var page = (pathname || '').split('/').pop();
    if (!page || page === '') return 'index.html';
    page = page.split('#')[0].split('?')[0];
    if (page.indexOf('.') === -1) page += '.html';
    return page;
  }

  var currentPage = normalizePage(window.location.pathname);

  var menu = document.getElementById('menu');
  if (menu) {
    function pageFromHref(href) {
      if (!href || href.charAt(0) === '#') return '';
      try {
        return normalizePage(new URL(href, window.location.href).pathname);
      } catch (err) {
        var file = href.split('/').pop() || 'index.html';
        file = file.split('#')[0].split('?')[0];
        if (file.indexOf('.') === -1) file += '.html';
        return file;
      }
    }

    function isNavLinkActive(linkPage, page) {
      if (!linkPage || !page) return false;
      if (linkPage === page) return true;
      if (linkPage === 'success-stories.html' && page.indexOf('story-') === 0) return true;
      if (linkPage === 'blog.html' && page.indexOf('blog-') === 0) return true;
      return false;
    }

    function markActiveLink(link) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');

      var parentDrop = link.closest('.nav-item.has-drop');
      if (!parentDrop) return;

      parentDrop.classList.add('is-active-section');
      var toggle = parentDrop.querySelector('.drop-toggle');
      if (toggle) {
        toggle.classList.add('is-active');
        toggle.setAttribute('aria-current', 'page');
      }
    }

    menu.querySelectorAll('a[href]').forEach(function (link) {
      if (!isNavLinkActive(pageFromHref(link.getAttribute('href')), currentPage)) return;
      markActiveLink(link);
    });
  }

  document.querySelectorAll('.page-hero .rv').forEach(function (el) {
    el.classList.add('in');
  });

  document.querySelectorAll('.page-hero .breadcrumb').forEach(function (breadcrumb) {
    if (breadcrumb.querySelector('.current')) return;
    var parts = breadcrumb.innerHTML.split(/<span class="sep">\s*\/\s*<\/span>/i);
    if (!parts.length) return;
    var last = parts[parts.length - 1].trim();
    if (!last) return;
    parts[parts.length - 1] = '<span class="current">' + last + '</span>';
    breadcrumb.innerHTML = parts.join('<span class="sep">/</span>');
  });

  var b = document.getElementById('burger');
  var m = document.getElementById('menu');
  var dropItems = document.querySelectorAll('.nav-item.has-drop');

  function closeDropdowns() {
    dropItems.forEach(function (item) {
      item.classList.remove('open');
      var toggle = item.querySelector('.drop-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  if (b && m) {
    b.addEventListener('click', function () {
      closeDropdowns();
      var o = m.classList.toggle('open');
      b.classList.toggle('x', o);
      b.setAttribute('aria-expanded', o);
    });
    m.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        m.classList.remove('open');
        b.classList.remove('x');
        b.setAttribute('aria-expanded', false);
        closeDropdowns();
      });
    });
    document.querySelectorAll('.nav-desktop-cta').forEach(function (a) {
      a.addEventListener('click', function () {
        m.classList.remove('open');
        b.classList.remove('x');
        b.setAttribute('aria-expanded', false);
        closeDropdowns();
      });
    });
  }

  dropItems.forEach(function (item) {
    var toggle = item.querySelector('.drop-toggle');
    var menu = item.querySelector('.drop-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var isOpen = item.classList.contains('open');
      closeDropdowns();
      if (!isOpen) {
        item.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeDropdowns();
        if (m && m.classList.contains('open')) {
          m.classList.remove('open');
          if (b) {
            b.classList.remove('x');
            b.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
  });

  document.addEventListener('click', closeDropdowns);
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeDropdowns();
  });

  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var was = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        var q = o.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!was) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var first = document.getElementById('first-name');
      var last = document.getElementById('last-name');
      var email = document.getElementById('email');
      var phone = document.getElementById('phone');
      var message = document.getElementById('message');
      var success = document.getElementById('form-success');
      if (!first || !last || !email || !phone || !message) return;
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      var subject = encodeURIComponent('Website enquiry from ' + first.value.trim() + ' ' + last.value.trim());
      var body = encodeURIComponent(
        'Name: ' + first.value.trim() + ' ' + last.value.trim() + '\n' +
        'Email: ' + email.value.trim() + '\n' +
        'Phone: ' + phone.value.trim() + '\n\n' +
        message.value.trim()
      );

      window.location.href = 'mailto:sally@baxtermason.com.au?subject=' + subject + '&body=' + body;

      if (success) {
        success.hidden = false;
        contactForm.querySelector('.contact-submit').disabled = true;
      }
    });
  }
})();
