
/* --------------------------
Speak About
A plugin for inline blog comments. 
Utilizes the Rangy library for range and selection, MIT License https://github.com/timdown/rangy
 -------------------------- */

 
// TODO Sprint 1
// Crossing multiple tags with a highlight builds multiple comment components. Bad.

/* Sprint 2  
Floating Controls. 
- display number of highlights
- toggle show/hide highlights
- list highlights
- go to highlight on list item click 

Sprint 3
- Generate report
- Send report on page close.
- Persistance. Rangy lib had something to keep highlights despite page reload. Look into that for my code? 
^ it would notify users past highlights have been submitted on page close. Needs to then differentiate them.. 
*/



// Setup Rangy
//-------------------------------------------
var serializedHighlights = decodeURIComponent(window.location.search.slice(window.location.search.indexOf("=") + 1));
var highlighter;
var initialDoc;

window.onload = function () {
  rangy.init();
  highlighter = rangy.createHighlighter();

  highlighter.addClassApplier(rangy.createClassApplier("h-item", {
    ignoreWhiteSpace: true,
    elementTagName: "mark",
    elementProperties: {
      href: "#"
      // onclick: function () {
      //   var highlight = highlighter.getHighlightForElement(this);
      //   if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
      //     highlighter.removeHighlights([highlight]);
      //   }
      //   return false;
      // }
    }
  }));
};
//-------------------------------------------

var state = {
  items : [
    /* 
      {
       id:0,
       comment:"",
       visible:false,
       numOfTags:0,
     },
    */
  ]
}

document.addEventListener('mouseup', () => {
  let highlight = document.getSelection();
  if (isNotJustAClick(highlight)){
    highlighter.highlightSelection("h-item");
    newItem();
  }
})

function isNotJustAClick(highlight) {
  return (highlight.anchorOffset !== highlight.focusOffset);
}

function newItem(){
  //grab all items, filter it down to only new ones (they don't have an h-id attribute)
  let items = [];
  items = document.querySelectorAll("mark");
  items = Array.prototype.slice.call(items).filter(x => !x.getAttribute('h-id'));
  //build the component
  items.forEach(el => {
    let id = getHighlightId(el);
    addHighlightToState(id);
    addIdToTag(el, id);
    addCommentComponent(el);
  });
}

function addHighlightToState(id){
  //check if highlight item is already in state
  let numOfTagsPerId = [];
  numOfTagsPerId = state.items.filter(item => { 
    return item.id === id; 
  })
  if (numOfTagsPerId.length === 0){
    state.items.push({
      id:id,
      comment:"",
      visible:true,
      numOfTags:1
    })
  }
  else {
    //already in state, just add to the numOfTags counter
    state.items.map( item => {
      if (item.id === id){
        item.numOfTags++; 
      } 
    })
  }
}

function addIdToTag(el, id){
  el.setAttribute("h-id", id);
}

function getHighlightId(el) {
  return highlighter.getHighlightForElement(el).id;
}


function addCommentComponent(el){
  state.items.push()
  el.insertAdjacentHTML("beforeend", 
    "<form class='h-comment'>" + 
      "<input type='text' name='comment' placeholder='Comment'>" +
      "<div class='h-close'>x</div>" +
    "</form>");
  addEventListenersToForm(el);

  //remove the browser highlight and keep just the CSS one.
  document.getSelection().removeAllRanges();
}

function addEventListenersToForm(el) {

  let id = getHighlightId(el);
  let items = document.querySelectorAll(`mark[h-id = "${id}"]`);
  items.forEach(el => {
    el.addEventListener("submit", e => {
      e.preventDefault();
      submitComment(el);
    })
  });

  let closeButtons = document.querySelectorAll(`mark[h-id = "${id}"] .h-close`);
  closeButtons.forEach(el => {
    el.addEventListener("click", e => {
      state.items.map(item => {
        if (item.id === id){
          item.visible = !item.visible;
          rerenderComponentsVisibility();
        }
      })
    })
  });
}

function submitComment(el){
  // makeInputReadOnlyOnSubmit(el)
  let inputField = el.childNodes[1].childNodes[0];
  inputField.blur();
}

function makeInputReadOnlyOnSubmit(inputField){
  inputField.setAttribute("readOnly", "")
}


function rerenderComponentsVisibility(){
  state.items.map( item => {
    if (item.visible){
      let tagList = document.querySelectorAll(`mark[h-id = "${item.id}"] form`);
      tagList.forEach(tag => {
        tag.classList.remove("hidden");
      });
    }
    else {
      let tagList = document.querySelectorAll(`mark[h-id = "${item.id}"] form`);
      tagList.forEach(tag => {
        tag.classList.add("hidden");
      });
    }
  })
}
