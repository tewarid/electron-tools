var id = 1
$(".list-group-item").on("click", (e) => {
    window.open(`dist/${e.target.id}/${e.target.id}.html`, `${e.target.id}-${id++}`, "menubar=no", false)
})
