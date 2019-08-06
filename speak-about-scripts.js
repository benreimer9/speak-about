

//RANGY
var serializedHighlights = decodeURIComponent(window.location.search.slice(window.location.search.indexOf("=") + 1));
var highlighter;
var initialDoc;

// TODO 
// put id in the mark tag so I can do my stuff completely separately from that. 
// I've figured out how to add more classes on (rangy-classapplier addClass() )
// but I need to bring the id into there when I do it and I'm getting stuck.
// a) how do I get the highlight ID in there without using the onclick function
// B) add param for id into addClass() 


window.onload = function () {
  rangy.init();
  addPopComponent();

  highlighter = rangy.createHighlighter();

  highlighter.addClassApplier(rangy.createClassApplier("highlight", {
    ignoreWhiteSpace: true,
    tagNames: ["span", "a"]
  }));

  highlighter.addClassApplier(rangy.createClassApplier("h-item", {
    ignoreWhiteSpace: true,
    elementTagName: "mark",
    tagNames: [],
    elementAttributes : {},
    elementProperties: {
      href: "#",
      onclick: function () {
        var highlight = highlighter.getHighlightForElement(this);
        console.log('highlight : ', highlight);
        showItem(highlight);
        // if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
        //   highlighter.removeHighlights([highlight]);
        // }
        return false;
      }
    }
  }));
};


function highlightSelectedText() {
  highlighter.highlightSelection("h-item");
}
function removeHighlightFromSelectedText() {
  highlighter.unhighlightSelection();
}

document.addEventListener('mouseup', e => {
  highlightSelectedText() 
})

function addPopComponent(){
  var h = document.getElementById("stats");
  h.insertAdjacentHTML("afterend", "<div id='popup'> Item </div>");
}

function showItem(item){
  let pop = document.querySelector("#popup");
  pop.innerHTML = "item ID : " + item.id;
}



