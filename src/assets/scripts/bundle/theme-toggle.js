const storageKey = 'theme-preference';
const themeColors = {
  dark: '{{ meta.themeLight }}',
  light: '{{ meta.themeDark }}'
};

const theme = {
  value: getColorPreference()
};

window.onload = () => {
  const lightThemeToggle = document.querySelector('#light-theme-toggle');
  const darkThemeToggle = document.querySelector('#dark-theme-toggle');
  const switcher = document.querySelector('[data-theme-switcher]');

  if (!switcher) {
    return;
  }

  reflectPreference();
  updateMetaThemeColor();

  lightThemeToggle.addEventListener('click', () => onClick('light'));
  darkThemeToggle.addEventListener('click', () => onClick('dark'));

  lightThemeToggle.setAttribute('aria-pressed', theme.value === 'light');
  darkThemeToggle.setAttribute('aria-pressed', theme.value === 'dark');
};

// sync with system changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({matches: isDark}) => {
  theme.value = isDark ? 'dark' : 'light';
  setPreference();
  updateMetaThemeColor();
});

function onClick(themeValue) {
  theme.value = themeValue;
  document.querySelector('#light-theme-toggle').setAttribute('aria-pressed', themeValue === 'light');
  document.querySelector('#dark-theme-toggle').setAttribute('aria-pressed', themeValue === 'dark');
  setPreference();
  updateMetaThemeColor();
}

function getColorPreference() {
  if (localStorage.getItem(storageKey)) {
    return localStorage.getItem(storageKey);
  } else {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

function setPreference() {
  localStorage.setItem(storageKey, theme.value);
  reflectPreference();
  updateMetaThemeColor();
}

function reflectPreference() {
  document.firstElementChild.setAttribute('data-theme', theme.value);
}

function updateMetaThemeColor() {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const newColor = theme.value === 'dark' ? themeColors.dark : themeColors.light;
  metaThemeColor.setAttribute('content', newColor);
}

// set early so no page flashes / CSS is made aware
reflectPreference();
