(function() {

  var catnipFrame = null;
  var consoleBacklog = [];

  var post = function(msg) {
    if (catnipFrame) {
      var command = "client-frame:" + JSON.stringify(msg);
      catnipFrame.postMessage(command, "*");
    }
  };

  window.console = {
    log: function() {
      var command = {
        console: {
          method: "log",
          arguments: Array.prototype.slice.call(arguments)
        }
      };
      if (catnipFrame)
        post(command);
      else
        consoleBacklog.push(command);
    }
  };

  var lastUrl = window.location.href;

  window.setInterval(function() {
    var currentUrl = window.location.href;
    if (currentUrl != lastUrl) {
      lastUrl = currentUrl;
      post({url: lastUrl});
    }
  }, 100);

  var postCurrentSource = function() {
    var command, code = Reveal.getCurrentSlide().querySelector("code");
    if (code) {
      code = code.innerHTML
        .replace(/<\/?span[^>]*>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
      post({source: code});
    }
  };

  window.addEventListener("message", function(event) {
    if (event.data === "hello") {
      catnipFrame = event.source;
      consoleBacklog.forEach(function(item) {
        catnipFrame.postMessage(JSON.stringify(item), "*");
      });
      consoleBacklog = [];
    } else if (event.data === "nextSlide") {
      Reveal.navigateNext();
    } else if (event.data === "previousSlide") {
      Reveal.navigatePrevious();
    } else if (event.data === "slideLeft") {
      Reveal.navigateLeft();
    } else if (event.data === "slideRight") {
      Reveal.navigateRight();
    } else if (event.data === "slideUp") {
      Reveal.navigateUp();
    } else if (event.data === "slideDown") {
      Reveal.navigateDown();
    } else if (event.data === "escape") {
      Reveal.toggleOverview();
    } else if (event.data === "getSource") {
      postCurrentSource();
    }
  }, false);
}());
