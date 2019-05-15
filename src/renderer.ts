var id = 1;
$(".list-group-item").on("click", (e) => {
    window.open(`${e.target.id}/main.html`, `${e.target.id}-${id++}`, "menubar=no", false);
});
