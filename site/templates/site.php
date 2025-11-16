<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>*_*</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= url('assets/css/site.css') ?>">
</head>
<body>
  <div class="header">
    <div class="site-title"><?= $site->siteTitle()->or('*_*') ?></div>
    <?php if ($site->about()->isNotEmpty()): ?>
      <div class="about"><?= $site->about()->html() ?></div>
    <?php endif ?>
  </div>
  
  <div class="project-list">
    <div class="project-row header-row">
      <div class="title" onclick="sortTable('title')">Project</div>
      <div class="preview"></div>
      <div class="date" onclick="sortTable('date')">Date</div>
      <div class="tag" onclick="sortTable('tag')">Tag</div>
    </div>
    
    <?php foreach ($site->children()->listed()->filterBy('intendedTemplate', 'project') as $project): ?>
    <?php 
      $previewImage = $project->preview()->toFile();
      $dateFormatted = $project->date()->toDate('m/Y');
    ?>
    <div class="project-row" data-date="<?= $dateFormatted ?>" data-title="<?= $project->title()->html() ?>" data-tag="<?= $project->tag()->html() ?>">
      <div class="title">
        <span class="project-title"><?= $project->title()->html() ?></span>
        <?php if ($project->description()->isNotEmpty()): ?>
          <br><?= $project->description()->html() ?>
        <?php endif ?>
      </div>
      <div class="preview">
        <?php if ($previewImage): ?>
          <a href="<?= $project->link() ?>">
            <img src="<?= $previewImage->url() ?>" alt="<?= $project->title()->html() ?> preview">
          </a>
        <?php endif ?>
      </div>
      <div class="date"><?= $dateFormatted ?></div>
      <div class="tag"><?= $project->tag()->html() ?></div>
    </div>
    <?php endforeach ?>
    
    <div class="project-row bottom-line">
      <div class="title"></div>
      <div class="preview"></div>
      <div class="date"></div>
      <div class="tag"></div>
    </div>
  </div>
  
  <div class="footer-links">
    <?php if ($site->email()->isNotEmpty()): ?>
      <a href="#" data-email="<?= base64_encode($site->email()) ?>">Email</a>
    <?php endif ?>
    
    <?php 
    $footerLinks = $site->footerLinks()->toStructure();
    if ($footerLinks->isNotEmpty()): 
      foreach ($footerLinks as $link): 
        if ($site->email()->isNotEmpty() || !$footerLinks->first()->is($link)): ?>
          <span class="separator">|</span>
        <?php endif ?>
        <a href="<?= $link->url() ?>" target="_blank"><?= $link->text()->html() ?></a>
      <?php endforeach;
    endif; ?>
  </div>
  
  <script>
    let currentSort = { column: null, ascending: true };
    
    function sortTable(column) {
      const list = document.querySelector('.project-list');
      const rows = Array.from(list.querySelectorAll('.project-row:not(.header-row):not(.bottom-line)'));
      
      // Toggle sort direction if clicking same column
      if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
      } else {
        currentSort.column = column;
        currentSort.ascending = true;
      }
      
      rows.sort((a, b) => {
        let aVal = a.dataset[column];
        let bVal = b.dataset[column];
        
        // Special handling for date column
        if (column === 'date') {
          // Convert MM/YYYY to YYYYMM for proper comparison
          const parseDate = (dateStr) => {
            const [month, year] = dateStr.split('/');
            return parseInt(year) * 100 + parseInt(month);
          };
          aVal = parseDate(aVal);
          bVal = parseDate(bVal);
        } else {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
      });
      
      // Re-append rows in sorted order
      const bottomLine = list.querySelector('.bottom-line');
      rows.forEach(row => list.appendChild(row));
      if (bottomLine) list.appendChild(bottomLine);
    }
    
    // Decode and reveal email on click (anti-spam)
    document.querySelectorAll('a[data-email]').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const email = atob(this.dataset.email);
        window.location.href = 'mailto:' + email;
      });
    });
  </script>
</body>
</html>
