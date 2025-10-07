// lib/htmlStyler.js
import * as cheerio from 'cheerio';

export function styleHtmlContent(htmlContent) {
  const $ = cheerio.load(htmlContent);

  // Generate IDs for headings and build navigation
  const headings = $('h1, h2, h3, h4, h5, h6');
  const navItems = [];

  headings.each((i, heading) => {
    const $heading = $(heading);
    let headingId = $heading.attr('id');

    if (!headingId) {
      const headingText = $heading.text().trim();
      headingId = headingText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[-\s]+/g, '-');
      headingId = `section-${i + 1}-${headingId}`;
      $heading.attr('id', headingId);
    }

    navItems.push({
      id: headingId,
      text: $heading.text().trim(),
      level: heading.tagName
    });
  });

  // Build navigation HTML
  let navHtml = '<nav class="sidebar"><div class="nav-header">📚 Daftar Isi</div><ul class="nav-menu">';
  
  navItems.forEach(item => {
    navHtml += `<li class="nav-item"><a class="nav-link ${item.level}" href="#${item.id}">${item.text}</a></li>`;
  });
  
  navHtml += '</ul></nav>';

  // Wrap sections with toggle functionality
  const sections = $('h2, h3, h4');
  sections.each((i, section) => {
    const $section = $(section);
    const $nextElements = $section.nextUntil('h1, h2, h3, h4');
    
    if ($nextElements.length > 0) {
      const sectionId = $section.attr('id');
      const sectionWrapper = `
        <div class="section" id="section-wrapper-${sectionId}">
          <div class="section-header">
            ${$section.prop('outerHTML')}
            <button class="toggle-btn" data-target="${sectionId}">Sembunyikan</button>
          </div>
          <div class="section-content" id="content-${sectionId}">
            ${$nextElements.map((_, el) => $(el).prop('outerHTML')).get().join('')}
          </div>
        </div>
      `;
      
      $section.replaceWith(sectionWrapper);
      $nextElements.remove();
    }
  });

  // Handle first h1 as header
  const $firstH1 = $('h1').first();
  let headerHtml = '';
  
  if ($firstH1.length) {
    const h1Id = $firstH1.attr('id') || 'main-title';
    headerHtml = `<div class="header"><h1 id="${h1Id}">${$firstH1.text()}</h1></div>`;
    $firstH1.remove();
  }

  // Wrap all content
  const bodyContent = $('body').html() || $.html();
  
  const styledHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${navItems[0]?.text || 'Article'}</title>
    </head>
    <body>
      <button class="toggle-nav" aria-label="Toggle Navigation">☰</button>
      <div class="container">
        ${navHtml}
        <div class="main-content">
          ${headerHtml}
          <div class="content">
            ${bodyContent}
          </div>
        </div>
      </div>
      <button class="back-to-top" aria-label="Back to Top">↑</button>
    </body>
    </html>
  `;

  return styledHtml;
}

export function extractTitle(htmlContent) {
  const $ = cheerio.load(htmlContent);
  
  // Try to get title from title tag
  let title = $('title').text().trim();
  
  // If no title tag, use first h1
  if (!title) {
    title = $('h1').first().text().trim();
  }
  
  // If still no title, use first heading
  if (!title) {
    title = $('h1, h2, h3').first().text().trim();
  }
  
  // Default title
  if (!title) {
    title = 'Untitled Article';
  }
  
  return title;
}