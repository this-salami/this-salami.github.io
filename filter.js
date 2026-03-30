let expanded = true;
const filters = document.getElementById("filter-box");

function showFilterList() {
  if (expanded) {
    filters.classList.add("hidden");
    //filters.style.display = "none";
    expanded = false;
  } else {
    filters.classList.remove("hidden");
    //filters.style.display = "flex";
    expanded = true;
  }
}

showFilterList();