$("#submitButton").click(function() {
  $.get("/search", function(data) {
    console.log(data);
  });
});