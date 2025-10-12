// © Manuel Matuzović: https://web.dev/website-navigation/ / Web Accessibility Cookbook

const nav = document.querySelector('nav');
const list = nav.querySelector('ul');
const burgerClone = document.querySelector('#burger-template').content.cloneNode(true);
const buttonDrawer = burgerClone.querySelector('button[data-drawer-toggle]');

list.style.setProperty('display', 'flex');

buttonDrawer.addEventListener('click', e => {
  const isOpenDrawer = buttonDrawer.getAttribute('aria-expanded') === 'true';
  buttonDrawer.setAttribute('aria-expanded', !isOpenDrawer);
});

const disableMenu = () => {
  buttonDrawer.setAttribute('aria-expanded', false);
};

//  close on escape
nav.addEventListener('keyup', event => {
  if (event.code === 'Escape') {
    disableMenu();
    buttonDrawer.focus();
  }
});

// close if clicked outside of event target
document.addEventListener('click', event => {
  const isClickInsideElement = nav.contains(event.target);
  if (!isClickInsideElement) {
    disableMenu();
  }
});

// avoid drawer flashing on page load
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    list.removeAttribute('no-flash');
  }, 100);
});

nav.insertBefore(burgerClone, list);
