(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.simpleslider = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function getdef(val, def) {
    return val == null ? def : val;
  }

  function len(arr) {
    return arr.length;
  }

  function startSlides(containerElem, children, unit, startVal, visVal, trProp) {
    var style = void 0,
        imgs = [];

    if (!children) {
      children = containerElem.children;
    }

    var i = len(children);

    while (--i >= 0) {
      imgs[i] = children[i];
      style = imgs[i].style;
      style.position = 'absolute';
      style.top = style.left = style.zIndex = 0;
      style[trProp] = startVal + unit;
    }

    style[trProp] = visVal + unit;
    style.zIndex = 1;

    return imgs;
  }

  function defaultEase(time, begin, change, duration) {
    return (time = time / (duration / 2)) < 1 ? change / 2 * time * time * time + begin : change / 2 * ((time -= 2) * time * time + 2) + begin;
  }

  function getSlider(options) {
    options = options || {};
    var actualIndex = void 0,
        interval = void 0,
        intervalStartTime = void 0,
        imgs = void 0,
        remainingTime = void 0;

    var containerElem = getdef(options.container, document.querySelector('*[data-simple-slider]'));
    var trProp = getdef(options.prop, 'left');
    var trTime = getdef(options.duration, 0.5);
    var delay = getdef(options.delay, 3) * 1000;
    var unit = getdef(options.unit, '%');
    var startVal = getdef(options.init, -100);
    var visVal = getdef(options.show, 0);
    var endVal = getdef(options.end, 100);
    var paused = options.paused;
    var ease = getdef(options.ease, defaultEase);
    var onChange = getdef(options.onChange, 0);
    var onChangeEnd = getdef(options.onChangeEnd, 0);

    function reset() {
      if (len(containerElem.children) > 0) {
        var style = containerElem.style;
        style.position = 'relative';
        style.overflow = 'hidden';
        style.display = 'block';

        imgs = startSlides(containerElem, options.children, unit, startVal, visVal, trProp);
        actualIndex = 0;
        remainingTime = delay;
      }
    }

    function setAutoPlayLoop() {
      intervalStartTime = Date.now();
      interval = setTimeout(function () {
        intervalStartTime = Date.now();
        remainingTime = delay;

        change(nextIndex());

        setAutoPlayLoop();
      }, remainingTime);
    }

    function resume() {
      if (isAutoPlay()) {
        if (interval) {
          clearTimeout(interval);
        }

        setAutoPlayLoop();
      }
    }

    function isAutoPlay() {
      return !paused && len(imgs) > 1;
    }

    function pause() {
      if (isAutoPlay()) {
        remainingTime = delay - (Date.now() - intervalStartTime);
        clearTimeout(interval);
        interval = 0;
      }
    }

    function reverse() {
      var newEndVal = startVal;
      startVal = endVal;
      endVal = newEndVal;
      actualIndex = Math.abs(actualIndex - (len(imgs) - 1));
      imgs = imgs.reverse();
    }

    function change(newIndex) {
      var count = len(imgs);
      while (--count >= 0) {
        imgs[count].style.zIndex = 1;
      }

      imgs[newIndex].style.zIndex = 3;
      imgs[actualIndex].style.zIndex = 2;

      anim([{
        elem: imgs[actualIndex].style,
        from: visVal,
        to: endVal
      }, {
        elem: imgs[newIndex].style,
        from: startVal,
        to: visVal
      }], trTime * 1000, 0, 0, ease);

      actualIndex = newIndex;

      if (onChange) {
        onChange(prevIndex(), actualIndex);
      }
    }

    function next() {
      change(nextIndex());
      resume();
    }

    function prev() {
      change(prevIndex());
      resume();
    }

    function nextIndex() {
      var newIndex = actualIndex + 1;
      return newIndex >= len(imgs) ? 0 : newIndex;
    }

    function prevIndex() {
      var newIndex = actualIndex - 1;
      return newIndex < 0 ? len(imgs) - 1 : newIndex;
    }

    function dispose() {
      clearTimeout(interval);

      imgs = containerElem = interval = trProp = trTime = delay = startVal = endVal = paused = actualIndex = remainingTime = onChange = onChangeEnd = null;
    }

    function currentIndex() {
      return actualIndex;
    }

    function anim(targets, transitionDuration, startTime, elapsedTime, easeFunc) {
      var count = len(targets);

      while (--count >= 0) {
        var target = targets[count];
        var newValue = void 0;
        if (startTime > 0) {
          newValue = easeFunc(elapsedTime - startTime, target.from, target.to - target.from, transitionDuration);

          if (elapsedTime - startTime < transitionDuration) {
            target.elem[trProp] = newValue + unit;
          } else {
            count = len(targets);
            while (--count >= 0) {
              target = targets[count];
              target.elem[trProp] = target.to + unit;
            }

            if (onChangeEnd) {
              onChangeEnd(actualIndex, nextIndex());
            }
            return;
          }
        }
      }

      requestAnimationFrame(function (time) {
        if (startTime === 0) {
          startTime = time;
        }

        anim(targets, transitionDuration, startTime, time, easeFunc);
      });
    }

    reset();

    if (imgs && len(imgs) > 1) {
      resume();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    });

    return {
      currentIndex: currentIndex,
      pause: pause,
      resume: resume,
      nextIndex: nextIndex,
      prevIndex: prevIndex,
      next: next,
      prev: prev,
      change: change,
      reverse: reverse,
      dispose: dispose
    };
  }

  exports.getSlider = getSlider;
});