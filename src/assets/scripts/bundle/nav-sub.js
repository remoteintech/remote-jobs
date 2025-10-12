const nav = document.querySelector('nav');
const navBreakpoint = '{{ designTokens.viewports.navigation }}';

// toggle submenu and aria-expanded on button click
nav.addEventListener('click', event => {
  const buttonSub = event.target.closest('button[data-submenu-toggle]');
  if (!buttonSub) return;

  const isOpenSub = buttonSub.getAttribute('aria-expanded') === 'true';

  // if above nav breakpoint, close any other open submenu first
  if (window.innerWidth >= navBreakpoint && !isOpenSub) {
    const openButton = nav.querySelector('button[data-submenu-toggle][aria-expanded="true"]');
    if (openButton && openButton !== buttonSub) {
      closeSubmenu(openButton);
    }
  }

  buttonSub.setAttribute('aria-expanded', String(!isOpenSub));
  const submenu = document.getElementById(buttonSub.getAttribute('aria-controls'));
  submenu.hidden = isOpenSub;
});

// close on click outside nav
document.addEventListener('click', event => {
  const openButton = nav.querySelector('button[data-submenu-toggle][aria-expanded="true"]');
  if (openButton && !nav.contains(event.target)) {
    closeSubmenu(openButton);
  }
});

// close on ESC
document.addEventListener('keyup', event => {
  if (event.code !== 'Escape') return;
  const openButton = nav.querySelector('button[data-submenu-toggle][aria-expanded="true"]');
  if (openButton) {
    closeSubmenu(openButton);
  }
});

function closeSubmenu(buttonSub) {
  const submenu = document.getElementById(buttonSub.getAttribute('aria-controls'));
  buttonSub.setAttribute('aria-expanded', 'false');
  submenu.hidden = true;
}
