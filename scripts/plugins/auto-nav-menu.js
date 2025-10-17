'use strict';

/**
 * Auto Navigation Menu Plugin for Hexo
 *
 * This plugin automatically generates navigation menu items from page files
 * in the source directory that have the 'auto_menu: true' front-matter.
 *
 * Usage in page front-matter:
 * ---
 * title: My Page
 * auto_menu: true
 * menu_title: Display Name (optional, defaults to title)
 * menu_icon: iconfont icon-custom (optional)
 * menu_order: 10 (optional, for sorting)
 * menu_parent: pages (optional, for nested menus)
 * ---
 */

hexo.extend.filter.register('before_generate', function() {
  const config = this.config;
  const themeConfig = this.theme.config;

  // Skip if fluid theme is not being used
  if (!themeConfig.navbar || !themeConfig.navbar.menu) {
    return;
  }

  // Get all pages
  const pages = this.locals.get('pages');
  const autoMenuPages = [];

  // Collect pages that should be in menu
  pages.forEach(page => {
    if (page.auto_menu === true) {
      autoMenuPages.push({
        title: page.menu_title || page.title || 'Untitled',
        link: page.path.replace(/index\.html$/, ''),
        icon: page.menu_icon || 'iconfont icon-books',
        order: page.menu_order !== undefined ? page.menu_order : 999,
        parent: page.menu_parent || null
      });
    }
  });

  // Skip if no auto menu pages found
  if (autoMenuPages.length === 0) {
    return;
  }

  // Sort by order
  autoMenuPages.sort((a, b) => a.order - b.order);

  // Get existing menu items (filter out previously generated items)
  const existingMenu = themeConfig.navbar.menu.filter(item => !item._auto_generated);

  // Group pages by parent
  const menuGroups = {};
  const topLevelPages = [];

  autoMenuPages.forEach(page => {
    if (page.parent) {
      if (!menuGroups[page.parent]) {
        menuGroups[page.parent] = [];
      }
      menuGroups[page.parent].push({
        key: page.title,
        name: page.title,
        link: '/' + page.link,
        icon: page.icon,
        _auto_generated: true
      });
    } else {
      topLevelPages.push({
        key: page.title,
        name: page.title,
        link: '/' + page.link,
        icon: page.icon,
        _auto_generated: true
      });
    }
  });

  // Build final menu structure
  const finalMenu = [...existingMenu];

  // Add grouped menu items
  Object.keys(menuGroups).forEach(parentKey => {
    const submenuItems = menuGroups[parentKey];

    // Check if parent menu already exists
    const existingParent = finalMenu.find(item => item.key === parentKey);

    if (existingParent) {
      // Add to existing parent's submenu
      if (!existingParent.submenu) {
        existingParent.submenu = [];
      }
      existingParent.submenu.push(...submenuItems);
    } else {
      // Create new parent menu with submenu
      finalMenu.push({
        key: parentKey,
        name: parentKey,
        icon: 'iconfont icon-books',
        submenu: submenuItems,
        _auto_generated: true
      });
    }
  });

  // Add top-level pages
  finalMenu.push(...topLevelPages);

  // Update theme config
  themeConfig.navbar.menu = finalMenu;

  // Log generated menu items
  const generatedCount = autoMenuPages.length;
  if (generatedCount > 0) {
    hexo.log.info(`Auto-generated ${generatedCount} menu item(s)`);
  }
});
