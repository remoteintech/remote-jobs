---
title: Navigation
---

Edit your navigation items in `src/_data/navigation.js`.

You have two options for mobile navigation: by default, the navigation on small displays is converted to small pills that wrap. This does not require any additional JavaScript.

**Drawer Menu**

You can activate a drawer menu for mobile in `src/_data/meta.js`:

```js
navigation: {
   // other settings
    drawerNav: true,
  },
```

`drawerNav` activates the navigation drawer, [built according to Manuel Matuzović's article on web.dev.](https://web.dev/articles/website-navigation)

Adjust your menu breakpoint in `src/_data/designTokens/viewports.json`

```json
{
 // ...
  "navigation": 662,
 // ...
}
```

**Submenu**

You can activate submenus in `src/_data/meta.js`:

```js
navigation: {
   // other settings
    subMenu: true,
  },
```

This includes the JavaScript for the submenu functionality. Add your submenu items to  `src/_data/navigation.js` using this structure:

```js
 {
  text: 'Unlinked parent',
  url: '#',
  submenu: [
    {
      text: 'Sub Item',
      url: '/sub-item/'
    },
    ... more items
  ]
},
```