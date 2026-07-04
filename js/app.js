(function () {
  'use strict';

  var SCREENS = ['screen-start', 'screen-rules', 'screen-game', 'screen-result'];
  var currentPhrase = '';
  var toastTimer = null;

  function showScreen(id) {
    SCREENS.forEach(function (screenId) {
      var el = document.getElementById(screenId);
      el.classList.toggle('screen--active', screenId === id);
    });

    if (id === 'screen-game') {
      requestAnimationFrame(function () {
        Game.resize();
        Game.start(onGameComplete);
      });
    }
  }

  function onGameComplete(result) {
    document.getElementById('result-direction').textContent = result.direction;
    document.getElementById('result-explanation').textContent = result.explanation;
    document.getElementById('result-phrase').textContent = result.phrase;
    currentPhrase = result.phrase;
    showScreen('screen-result');
    requestAnimationFrame(function () {
      if (window.Confetti) {
        Confetti.burst();
      }
    });
  }

  function showToast(message, isError) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('toast--visible', 'toast--error');
    if (isError) toast.classList.add('toast--error');

    requestAnimationFrame(function () {
      toast.classList.add('toast--visible');
    });

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('toast--visible');
    }, 2800);
  }

  function copyPhrase() {
    var text = currentPhrase;
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () {
          showToast('Фраза скопирована');
        })
        .catch(function () {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      var ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (ok) {
        showToast('Фраза скопирована');
      } else {
        showToast('Не получилось скопировать. Выделите фразу вручную.', true);
      }
    } catch (e) {
      document.body.removeChild(textarea);
      showToast('Не получилось скопировать. Выделите фразу вручную.', true);
    }
  }

  function bindEvents() {
    document.querySelector('[data-action="go-rules"]').addEventListener('click', function () {
      showScreen('screen-rules');
    });

    document.querySelector('[data-action="start-game"]').addEventListener('click', function () {
      showScreen('screen-game');
    });

    document.getElementById('btn-copy').addEventListener('click', copyPhrase);

    window.addEventListener('resize', function () {
      if (document.getElementById('screen-game').classList.contains('screen--active')) {
        Game.resize();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Game.init();
    bindEvents();
  });
})();
