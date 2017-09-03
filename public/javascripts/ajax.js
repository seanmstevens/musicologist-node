let musicInfo = [];

function addSongFromField(event) {
  event.preventDefault();

  const info = $('#musicField').val().replace(/ /g, '+').toLowerCase();

  if (!info) {
    alert('Please enter some music interests');
  } else {
    musicInfo.push(info);
    renderList();
    $('#musicField').eq(0).val('');
  }
}

$('#addButton').click(addSongFromField);
$('#musicField').keyup(function(event) {
  if (event.which == 13) { // User presses Enter
    addSongFromField(event);
  }
});

function renderList() {
  const $list = $('#playlistParameters').eq(0);

  $list.empty();

  $.each(musicInfo, function(idx, info) {
    info = info.replace(/\+/g, ' ');
    const $item = $('<li class="list-group-item">').text(info);
    $item.append('<span class="close-btn">&#10006;</span>')

    $list.append($item)
  });
}

function generateResults(results) {
  const $container = $('#musicQueryResults');
  const $table = $('<table class="col"></table>');
  const $tableHead = $('<thead><tr><th>Song</th><th>Artist</th><th>Album</th></tr></thead>');
  const $tableBody = $('<tbody></tbody>');
  const $row = $('<tr></tr>');

  $table.append($tableHead).append($tableBody);
  $container.append($table);

  $.each(results, function(key, value) {
    const $thisRow = $row.clone();
    $thisRow.append('<td class="song-column">' + value.track + '</td>')
      .append('<td class="artist-column">' + value.artist + '</td>')
      .append('<td class="album-column">' + value.album + '</td>')
    $tableBody.append($thisRow);
  });
}

// Toggle display of AJAX preloader animation

$(document).ajaxStart(function() {
  $('#loader').css({'display': 'flex'});
});

$(document).ajaxComplete(function() {
  $('#loader').css({'display': 'none'});
});

$('#getPlaylistBtn').click(function(event) {

  const input = $('#musicField');

  if (musicInfo.length === 0) {
    input.popover('enable').popover('show');
    input.click(function() {
      $(this).popover('hide').popover('disable');
    });
  } else {
    let searchTerm = musicInfo.join('+');

    $('#musicQueryResults').empty();

    $('#playlistModal').modal('show');

    $.ajax({
      url: '/search',
      dataType: 'json',
      data: {
        term: searchTerm
      }
    }).done(function(data) {
      if (data.length === 0) {
        $('#musicQueryResults')
          .append('<h3 class="header-small-margin">No results found.</h3>')
          .append('<small>Try narrowing your search results.</small>');
      } else {
        generateResults(data)
      }
    }).catch(function(err) {
        console.error('Error:', err);
    });
  }
});

$(document.body).on({click: function() {
    const info = $(this).parent().contents().filter(function() {
      return this.nodeType == 3;
    })[0].nodeValue.replace(/ /g, '+');
    musicInfo = $.grep(musicInfo, function(value) {
      return value != info;
    });
    renderList();
  }
}, '.close-btn');
