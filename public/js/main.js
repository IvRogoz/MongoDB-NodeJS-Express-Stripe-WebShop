(function ($) {
  "use strict";

  const $elems = document.querySelectorAll('.cat_pro')
  const elems = Array.from($elems)
  elems.forEach(a => {
    a.onclick = (e) => {
      console.log(a.href)
      e.preventDefault()

      fetch(a.href)
        .then((response) => response.text())
        .then((html) => {
          setInnerHTML(document.getElementById('main-content'), html)
          // document.getElementById('main-content').innerHTML = html
        })
        .catch((error) => {
          console.warn(error)
        })
    }
  })

  if ($('[data-fancybox]').length) {
    Fancybox.bind('[data-fancybox]')
  }

  if ($('textarea#ta').length) {
    CKEDITOR.config.entities_latin = false
    CKEDITOR.replace('ta', {
      extraPlugins: 'filebrowser',
      filebrowserBrowseUrl: '/get-images', // upload location
      filebrowserUploadMethod: 'form',
      filebrowserUploadUrl: '/admin/pages/upload'// route
    })
  }

  $('a.confirmDeletion').on('click', () => {
    if (!confirm('Confirm deletion')) { return false }
  })

  let setInnerHTML = (elm, html) => {
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes)
        .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  // Spinner
  let spinner = () => {
    setTimeout(() => {
      if ($('#spinner').length > 0) {
        $('#spinner').removeClass('show')
      }
    }, 1)
  }

  spinner()

  // Initiate the wowjs
  new WOW().init()

  // Back to top button
  $(window).scroll( () => {
    if ($(this).scrollTop() > 300) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.back-to-top').click( () => {
    $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
    return false;
  });

  // Facts counter
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 2000
  });

})(jQuery);
