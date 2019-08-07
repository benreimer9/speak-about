
/* --------------------------
Speak About
A plugin for inline blog comments. https://github.com/benreimer9/speak-about
Utilizes the Rangy library for range and selection, MIT License https://github.com/timdown/rangy
 -------------------------- */


// TODO Sprint 1
// ! BUG : Crossing multiple tags, or other highlights, with a new highlight is very messy. 
// ! ^ also sometimes fails to grab the element id... ? 
// ! build in guards in case the page has other <mark> tags on it

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
    }
  }));
};
//-------------------------------------------

let state = {
  items : [
    /* example item
      {
       id:0,
       comment:"",
       visible:false,
       numOfTags:0,
     },
    */
  ]
}

function setupSpeakAbout(){
  document.addEventListener('mouseup', () => {
    let highlight = document.getSelection();
    if (isNotJustAClick(highlight)) {
      buildNewItem();
    }
  })
}

function isNotJustAClick(highlight) {
  return (highlight.anchorOffset !== highlight.focusOffset);
}


//-------------------------------------------
// Building a new item, which can be composed of multiple <mark> tags but one itemId to unify them 

function buildNewItem(){

  highlighter.highlightSelection("h-item");
  let newMarkTags = findNewMarkTags();
  newMarkTags.forEach(tag => {
    let itemId = getIdFromTag(tag);
    addItemToState(itemId);
    addIdToTag(tag, itemId);
    addComment(tag, itemId);
  });
}

function findNewMarkTags(){
  // new mark tags do not have h-id attributes 
  let newMarktags = [];
  allMarkTags = document.querySelectorAll("mark");
  newMarktags = Array.prototype.slice.call(allMarkTags)
    .filter(tag => !tag.getAttribute('h-id'));
  return newMarktags;
}

function addItemToState(itemId){
  if (itemIsAlreadyInState(itemId)){
    state.items.map(item => {
      if (item.id === itemId) {
        item.numOfTags++;
      }
    })
  }
  else {
    state.items.push({
      id: itemId,
      comment:"",
      visible:true,
      numOfTags:1
    })
  }
}
function itemIsAlreadyInState(id){
  let numOfTagsPerId = [];
  numOfTagsPerId = state.items.filter(item => {
    return item.id === id;
  })
  return numOfTagsPerId.length !== 0 
}

function addIdToTag(tag, itemId){
  tag.setAttribute("h-id", itemId);
}

function getIdFromTag(tag) {
  return highlighter.getHighlightForElement(tag).id;
}

//-------------------------------------------
// Comments

const commentHTML =
  "<form class='h-comment'>" +
  "<input type='text' name='comment' placeholder='Comment' autocomplete='false'>" +
  "<div class='h-close'>x</div>" +
  "</form>"

function addComment(tag, itemId){
  tag.insertAdjacentHTML("beforeend", commentHTML);
  addEventListenersToComment(itemId);
  document.getSelection().removeAllRanges(); //remove the browser highlight and keep just the CSS one for better UX
}

function addEventListenersToComment(itemId) {
  let itemMarkTags = document.querySelectorAll(`mark[h-id = "${itemId}"]`);
  itemMarkTags.forEach(tag => {
    tag.addEventListener("submit", event => {
      event.preventDefault();
      submitComment(tag);
    })
  });

  let closeButtons = document.querySelectorAll(`mark[h-id = "${itemId}"] .h-close`);
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      toggleCommentVisibility(itemId)
    })
  });
}

function toggleCommentVisibility(itemId) {
  state.items.map(item => {
    if (item.id === itemId) {
      item.visible = !item.visible;
      rerenderComponentsVisibility();
    }
  })
}

function submitComment(el){
  // ! need a more versatile method here than grabbing childNodes[x], breaks too easily
  let inputField = el.childNodes[1].childNodes[0];
  inputField.blur();
}

function rerenderComponentsVisibility(){
  state.items.map( item => {
    if (item.visible){
      let itemForms = document.querySelectorAll(`mark[h-id = "${item.id}"] form`);
      itemForms.forEach(form => {
        form.classList.remove("hidden");
      });
    }
    else {
      let itemForms = document.querySelectorAll(`mark[h-id = "${item.id}"] form`);
      itemForms.forEach(form => {
        form.classList.add("hidden");
      });
    }
  })
}

setupSpeakAbout()