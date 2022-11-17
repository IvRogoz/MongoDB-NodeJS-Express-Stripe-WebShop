$(()=>{

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
                  //document.getElementById('main-content').innerHTML = html
              })
              .catch((error) => {
                  console.warn(error)
              })
          }
  })
})