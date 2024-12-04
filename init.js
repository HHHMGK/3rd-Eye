(function () {
    // function fnAddButtons() {
    //   var btn = document.createElement("input");
    //   btn.value = "Search Mathemafia";
    //   btn.id = "search-mm-btn";
    //   btn.type = "submit";
    //   document.querySelector(".FPdoLc.lJ9FBc center").appendChild(btn);
    // }

    function createFloatingButton() {
        // Create a button element
        const btn = document.createElement("button");
        btn.id = "floating-mm-btn";
        btn.textContent = "Search Mathemafia";
    
        // Style the button to float at the bottom right
        btn.style.position = "fixed";
        btn.style.bottom = "20px";
        btn.style.right = "20px";
        btn.style.padding = "10px 15px";
        btn.style.backgroundColor = "#4CAF50"; // Green background
        btn.style.color = "white"; // White text
        btn.style.border = "none"; // No border
        btn.style.borderRadius = "5px"; // Rounded corners
        btn.style.cursor = "pointer"; // Pointer cursor on hover
        btn.style.zIndex = "1000"; // Ensure it's above other elements
    
        // Append the button to the body
        document.body.appendChild(btn);
    }
  
    // function fnDefineEvents() {
    //   document
    //     .getElementById("search-mm-btn")
    //     .addEventListener("click", function (event) {
    //       fnSearch(event.target.value.split(" ")[1]);
    //     });
    // }
    // function fnSearch(str) {
    //   document.querySelector(".gLFyf.gsfi").value = str;
    // }
  
    // fnAddButtons();
    // fnDefineEvents();
    createFloatingButton();
  })();