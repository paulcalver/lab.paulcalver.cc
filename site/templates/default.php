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
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      padding: 20px;
      background: white;
    }
    
    .header {
      margin-bottom: 20px;
    }
    
    .project-list {
      display: table;
      border-collapse: collapse;
    }
    
    .project-row {
      display: table-row;
    }
    
    .project-row > div {
      display: table-cell;
      padding: 20px 80px 20px 0;
      white-space: nowrap;
      vertical-align: top;
      border-top: 1px solid black;
    }
    
    .header-row {
      font-weight: bold;
      cursor: pointer;
      user-select: none;
    }
    
    .header-row > div {
      border-top: none;
    }
    
    .header-row > div:hover {
      text-decoration: underline;
    }
    
    .preview img {
      width: 250px;
      height: auto;
      display: block;
    }
    
    a {
      color: black;
      text-decoration: underline;
    }
    
    a:visited {
      color: black;
    }
    
    a:hover {
      color: black;
    }
    
    a:active {
      color: black;
    }
  </style>
</head>
<body>
  <div class="header">*_*</div>
  
  <div class="project-list">
    <div class="project-row header-row">
      <div class="title" onclick="sortTable('title')">Title</div>
      <div class="preview">Preview</div>
      <div class="date" onclick="sortTable('date')">Date</div>
      <div class="tag" onclick="sortTable('tag')">Tag</div>
    </div>
    
    <?php foreach ($site->children()->listed() as $project): ?>
    <?php 
      $previewImage = $project->preview()->toFile();
      $dateFormatted = $project->date()->toDate('m/Y');
    ?>
    <div class="project-row" data-date="<?= $dateFormatted ?>" data-title="<?= $project->title()->html() ?>" data-tag="<?= $project->tag()->html() ?>">
      <div class="title"><a href="<?= $project->link() ?>"><?= $project->title()->html() ?></a></div>
      <div class="preview">
        <?php if ($previewImage): ?>
          <img src="<?= $previewImage->url() ?>" alt="<?= $project->title()->html() ?> preview">
        <?php endif ?>
      </div>
      <div class="date"><?= $dateFormatted ?></div>
      <div class="tag"><?= $project->tag()->html() ?></div>
    </div>
    <?php endforeach ?>
    
  </div>
  
  <script>
    let currentSort = { column: null, ascending: true };
    
    function sortTable(column) {
      const list = document.querySelector('.project-list');
      const rows = Array.from(list.querySelectorAll('.project-row:not(.header-row)'));
      
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
      rows.forEach(row => list.appendChild(row));
    }
  </script>
</body>
</html>
