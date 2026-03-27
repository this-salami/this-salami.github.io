let expanded = true;
const checkboxes = document.getElementById("checkboxes");

function showFilterList() {
  if (expanded) {
    checkboxes.classList.add("hidden");
    //checkboxes.style.display = "none";
    expanded = false;
  } else {
    checkboxes.classList.remove("hidden");
    //checkboxes.style.display = "flex";
    expanded = true;
  }
}

showFilterList();