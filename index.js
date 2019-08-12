
/* --------------------------
Speak About
A plugin for inline blog comments. https://github.com/benreimer9/speak-about
Utilizes the Rangy library for range and selection, MIT License https://github.com/timdown/rangy
 -------------------------- */

/* Sprint 2  
- Generate report
- Send report on page close.

Sprint 3
Floating Controls. 
- display number of highlights
- toggle show/hide highlights
- list highlights
- go to highlight on list item click 

Sprint 4
- Persistance. Rangy lib had something to keep highlights despite page reload. Look into that for my code? 
^ it would notify users past highlights have been submitted on page close. Needs to then differentiate them.. 
- build in guard in case the page has other <mark> tags on it
- get off jQuery since you're barely using it
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





//-------------------------------------------

let state = {
  items : [
    /* example item
      {
       id:0,
       highlightText:"",
       highlightTextContext:"", 
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
  });
  // window.addEventListener('beforeunload', (event) => {
  //   sendReport();
  // });
}

function isNotJustAClick(highlight) {
  return (highlight.anchorOffset !== highlight.focusOffset);
}


//-------------------------------------------
// Building a new item, which can be composed of multiple <mark> tags but one itemId to unify them 
let highlightInfo;

function buildNewItem(){
  highlighter.highlightSelection("h-item");
  let newMarkTags = findNewMarkTags();
  let itemId = null;
  newMarkTags.forEach(tag => {
    if (itemId === null){
      //on multi-tag highlights the last getIdFromHighlight fails for unknown reasons
      //this is a simple way of just avoiding that altogether. Only get it the first time, then store.
      itemId = getIdFromHighlight(tag)
    } 
    addItemToState(tag, itemId);
    addIdToTag(tag, itemId);
    addCommentComponent(tag, itemId);
  });
}

function getHighlightEl(tag){
  return highlighter.getHighlightForElement(tag);
}

function findNewMarkTags(){
  // new mark tags do not have h-id attributes 
  let newMarktags = [];
  allMarkTags = document.querySelectorAll("mark");
  newMarktags = Array.prototype.slice.call(allMarkTags)
    .filter(tag => !tag.getAttribute('h-id'));
  return newMarktags;
}

function addItemToState(tag, itemId){
  
  //numOfTags
  if (itemIsAlreadyInState(itemId)){
    state.items.map(item => {
      if (item.id === itemId) {
        item.numOfTags++;
        item.highlightText += tag.innerText;
      }
    })
  }
  else {
    state.items.push({
      id: itemId,
      comment:"",
      visible:true,
      numOfTags:1,
      highlightText: tag.innerText,
      highlightTextContext: "temp"
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

function getIdFromHighlight(tag) {
  return highlighter.getHighlightForElement(tag).id;
}

//-------------------------------------------
// Comments

const commentHTML =
  "<form class='h-comment'>" +
  "<input type='text' name='comment' placeholder='Comment' autocomplete='false'>" +
  "<div class='h-close'>x</div>" +
  "</form>"

function addCommentComponent(tag, itemId){
  tag.insertAdjacentHTML("beforeend", commentHTML);
  addEventListenersToComment(itemId);
  document.getSelection().removeAllRanges(); //remove the browser highlight and keep just the CSS one for better UX
}

function addEventListenersToComment(itemId) {
  let itemMarkTags = document.querySelectorAll(`mark[h-id = "${itemId}"]`);
  itemMarkTags.forEach(tag => {
    tag.addEventListener("submit", event => {
      event.preventDefault();
      submitComment(tag, itemId);
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

function submitComment(tag, itemId){
  // ! need a more versatile method here than grabbing childNodes[x], breaks too easily
  let inputField = tag.childNodes[1].childNodes[0];
  inputField.blur();
  //take innerText, add to state ID 
  let comment = document.querySelector(`mark[h-id = "${itemId}"] input`).value;
  state.items.forEach(item => {
    if (item.id === itemId)  item.comment = comment; 
  })
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

//-------------------------------------------
// Sending Report 
function sendReport(){
  event.preventDefault();
  event.returnValue = '';
  let report = "";
  state.items.forEach(item => {
    report += 
      "<div> " +
      item.highlightText +
      " </div>" +
      "<div> " +
      item.comment + 
      " </div> " +
      "<br>"
  })
  console.log('report : ', report);
}


(function ($) {
$(document).ready( function(){
  document.querySelector("#contact").addEventListener("submit", e => {
     e.preventDefault() 
    sendMail(e);
  });
});


function sendMail(e){

  var adminHref = sa_ajax.ajaxurl;

  var forwhat = $("#contact-for").val();
  var name = $("#contact-name").val();
  var email = $("#contact-email").val();

  
  var data = { 'action': 'siteWideMessage', 'values': forwhat };

  $.post(adminHref, data, function (response) {
    console.log('yooo ', response);
  });
  

};

}(jQuery))




// var ajaxurl = 'http://www.reformeducators.org/wp-content/themes/NATE/admin-ajax.php';
// stringDifference = JSON.stringify(difference);
// stringDropDifference = JSON.stringify(dropDifference);
// stringUsername = String(username);


// $.post(ajaxurl, { 'Name': stringUsername, 'Changes Made': stringDifference, 'Drop Down Menu Changes': stringDropDifference });


setupSpeakAbout()