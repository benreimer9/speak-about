/* --------------------------
Speak About
A plugin for inline blog comments. https://github.com/benreimer9/speak-about
Utilizes the Rangy library for range and selection, MIT License https://github.com/timdown/rangy

https://github.com/timdown/rangy/wiki/

 -------------------------- */
 let s; 
(function ($) {
$(document).ready(function () {

/* 

UX, Submit comment inputs that haven't been submitted
- users may not hit enter on their comments. They should still be submitted regardless. (update every second? or on click away?)

- highlight deletion

Floating Controls. 
- display number of highlights
- toggle show/hide highlights
- list highlights
- go to highlight on list item click 

Intro paragraph 
- content
- figure out how it should be placed into page content

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

  highlighter.addClassApplier(rangy.createClassApplier("h_item", {
    ignoreWhiteSpace: true,
    elementTagName: "mark",
    elementProperties: {
      href: "#"
    }
  }));
};
//-------------------------------------------




// SETUP 
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
  ],
};
s = state;

function setupSpeakAbout(){
  document.addEventListener('mouseup', () => {
    let highlight = document.getSelection();
    if (isNotJustAClick(highlight)) {
        if (!isMobile()){
            buildNewItem();
        } 
    }
  });
  updatePageSelectionColor();
}

function isNotJustAClick(highlight) {
  return (highlight.anchorOffset !== highlight.focusOffset);
}

function updatePageSelectionColor(){  
  if (typeof highlightColor !== 'undefined') {
    let style = document.createElement('style');
    style.innerHTML = `
      .h_item {
        background-color: ${highlightColor};
      }
      .h_close {
        border-color: ${highlightColor};
      }
      .hidden .h_close {
        background-color: ${highlightColor};
      }
      ::selection {
          background-color: ${highlightColor} !important;
      }
    `;
    document.querySelector("body").insertAdjacentElement("afterbegin", style)
  }
}



// NEW ITEM 
//-------------------------------------------
// Building a new item, which can be composed of multiple <mark> tags but one itemId to unify them 
function buildNewItem(){
  highlighter.highlightSelection("h_item", { exclusive: false });
  let newMarkTags = findNewMarkTags();
  let itemId = null;
  newMarkTags.forEach(tag => {
    if (itemId === null){
      //on multi-tag highlights the last getIdFromHighlight fails for unknown reasons
      //this if statement is a simple way of just avoiding that altogether. Only get it the first time, then store.
      itemId = getIdFromHighlight(tag)
    } 
    addIdToTag(tag, itemId);
    addCommentComponent(tag, itemId);
    addItemToState(tag, itemId);
  });
  removeExtraCommentComponents(itemId);
}

function getHighlightEl(tag){
  return highlighter.getHighlightForElement(tag);
}

function findNewMarkTags(){
  // new mark tags do not have h_id attributes 
  let newMarktags = [];
  let allMarkTags = document.querySelectorAll("mark");
  newMarktags = Array.prototype.slice
    .call(allMarkTags)
    .filter(tag => !tag.getAttribute('h_id'));
  return newMarktags;
}

function addItemToState(tag, itemId){
  if (itemIsAlreadyInState(itemId)){
    state.items.map(item => {
      if (item.id === itemId) {
        item.numOfTags++;
        item.highlightText += tag.innerText;
        item.highlightTextContext = getHighlightTextContext(tag, itemId)
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
      highlightTextContext: getHighlightTextContext(tag, itemId)
    })
  }
}

function getHighlightTextContext(tag, itemId) {
  //make a separate hidden copy of the highlight and text I can manipulate to get the proper format. Remove once complete.
  let elem = getHighlightEl(tag);
  let getRange = elem.getRange()
  let parentElement = getRange.commonAncestorContainer.innerHTML;
  let shadowElement = `<div id="SA_SHADOW" style="display:none"></div>`;
  document.querySelector("body").insertAdjacentHTML("beforeend", shadowElement);
  document.querySelector('#SA_SHADOW').innerHTML = parentElement;

  //remove comments from the shadow version
  let shadowComments = document.querySelectorAll(`#SA_SHADOW .h_comment`);
  shadowComments.forEach(el => {
    el.remove();
  });

  //reform the highlight with a span and inline CSS so the highlight appears in the email
  let highlightItemsList = document.querySelectorAll(`#SA_SHADOW mark[h_id="${itemId}"]`);
  let startHighlightStyling = `<span class="SA_HIGHLIGHT" style="line-height: 12px; font-size: 16px; margin: 0; padding:3px; background-color:#ffc2c2">`
  let endHighlightStyling = `</span>`;
  let lastHighlightTextLength; //this will be needed later
  highlightItemsList.forEach(item => {
    item.innerText = startHighlightStyling + item.innerText + endHighlightStyling;
    lastHighlightTextLength = item.innerText.length; 
  })

  let plainTextShadow = document.querySelector("#SA_SHADOW").innerText;
  let firstHighlightPos = plainTextShadow.indexOf(`<span class="SA_HIGHLIGHT"`); //finds first highlight
  let lastHighlightPos = plainTextShadow.lastIndexOf(`<span class="SA_HIGHLIGHT"`); //finds last highlight
  let numOfExtraCharactersForContext = 150; 
  let startingDots = "...";
  let endingDots = "...";

  let sliceStartPoint = firstHighlightPos - numOfExtraCharactersForContext;
  if (sliceStartPoint <= 0){
    sliceStartPoint = 0;
    startingDots = "";
  } 
  let sliceEndPoint = lastHighlightPos + lastHighlightTextLength + numOfExtraCharactersForContext;
  if (sliceEndPoint > plainTextShadow.length){
    sliceEndPoint = plainTextShadow.length;
    endingDots = "";
  } 
  let shortenedPlainTextShadow = plainTextShadow.slice(sliceStartPoint, sliceEndPoint);
  let reportHTML = `<p>${startingDots}${shortenedPlainTextShadow}${endingDots}</p>`;

  document.querySelector('#SA_SHADOW').remove();
  return reportHTML;

  // TODO further sanitizing for code 
  // hypothetically a user could write code in their comment that stays as a string until
  // I send it out in the email, then gets converted to html / css 
}

function itemIsAlreadyInState(id){
  let numOfTagsPerId = [];
  numOfTagsPerId = state.items.filter(item => {
    return item.id === id;
  })
  return numOfTagsPerId.length !== 0 
}

function addIdToTag(tag, itemId){
  tag.setAttribute("h_id", itemId);
}

function getIdFromHighlight(tag) {
  return highlighter.getHighlightForElement(tag).id;
}

function removeExtraCommentComponents(itemId){
  //check number of tags for the Id. If multiple tags, remove all comments but the last 
  let numberOfTags = state.items.map( item => {
    if (item.id === itemId) return item.numOfTags;
  })
  let commentComponentList; 
  if (numberOfTags > 1){
    commentComponentList = document.querySelectorAll(`mark[h_id = "${itemId}"] .h_comment`);
    for (i = 0; i < numberOfTags; i++) {
      if (i != numberOfTags - 1) {
        commentComponentList[i].remove(); 
      }
    }
  }
}



// MOBILE
//-------------------------------------------
/* 
1. Register a highlight
2. Pop up the 'write a comment' box
3. Both close and submit should submit the comment unless it is empty. (maybe?)
*/

function setupMobile(){
  if (isMobile()){
    window.addEventListener("touchend", function(){
      if (window.getSelection().toString()){
        showMobileCommentBtn();
      }
    })
    window.addEventListener("touchstart", function () {
      if (!window.getSelection().toString()) {
        hideMobileCommentBtn();
      }
    })
  }
  // listen for highlights, then call showMobileComment
}
function isMobile(){
  return 'ontouchstart' in window;
}

function showMobileCommentBtn(){

  var commentButtonHTML = "<div id='sa_commentBtn'>Write a comment</div>";
  var commentButton = document.querySelector("#sa_commentBtn");
  var body = document.querySelector("body");

  if (commentButton == null){
    body.insertAdjacentHTML('beforeend', commentButtonHTML);
  }

  document.querySelector("#sa_commentBtn").classList.add('sa_visible');

  document.querySelector("#sa_commentBtn").addEventListener("touchstart", function(){
    mobileComment();
  });
  //Show a "write comment" button 
  //If they click the button, then call buildNewItem()
}

function mobileComment(){
    highlighter.highlightSelection("h_item");
    buildNewItem();


}

 function hideMobileCommentBtn(){
    document.querySelector("#sa_commentBtn").remove();
 }


setupMobile();



// COMMENTS
//-------------------------------------------

const commentHTML =
  "<form class='h_comment'>" +
    "<input type='text' name='comment' placeholder='Comment' autocomplete='false'>" +
    "<div class='h_close'>" + 
     // `<svg style='width:16px; height:16px' viewbox='0 0 100 100'> <g id="Version-One" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Desktop-HD" 
     //   fill="#AAAAAA" fill-rule="nonzero"><path d="M316.070312,611 L320.5,605.03125 L316.59375,599.546875 L318.398438,599.546875 L320.476562,602.484375 C320.908856,603.093753 321.216145,603.562498 321.398438,603.890625 C321.653647,603.473956 321.955727,603.039065 322.304688,602.585938 L324.609375,599.546875 L326.257812,599.546875 L322.234375,604.945312 L326.570312,611 L324.695312,611 L321.8125,606.914062 C321.651041,606.679686 321.484376,606.424481 321.3125,606.148438 C321.05729,606.565106 320.875001,606.851562 320.765625,607.007812 L317.890625,611 L316.070312,611 Z" id="X"></path></g></g></svg>` +
    "</div>" +
  "</form>"

function addCommentComponent(tag, itemId){
  tag.insertAdjacentHTML("beforeend", commentHTML);
  addEventListenersToComment(itemId);
  //document.getSelection().removeAllRanges(); //remove the browser highlight and keep just the CSS one for better UX
}

function addEventListenersToComment(itemId) {
  let itemMarkTags = document.querySelectorAll(`mark[h_id = "${itemId}"]`);
  itemMarkTags.forEach(tag => {
    tag.addEventListener("submit", event => {
      event.preventDefault();
      submitComment(tag, itemId);
    })
  });

  let closeButtons = document.querySelectorAll(`mark[h_id = "${itemId}"] .h_close`);
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
  // ! need a more versatile method here than grabbing childNodes[x], breaks too easily on html changes
  let inputField = tag.childNodes[1].childNodes[0];
  inputField.blur();
  //take innerText, add to state ID 
  let comment = document.querySelector(`mark[h_id = "${itemId}"] input`).value;
  state.items.forEach(item => {
    if (item.id === itemId){
      item.comment = comment; 
    }  
  });

  if (comment !== ""){
    buildFeedbackObj(itemId);
  }
}

function buildFeedbackObj(itemId){
  // This is mostly unnecessary, but does make things a bit cleaner later on. 
  var feedback = {};
  state.items.forEach(item => {
    if (item.id === itemId) {
      feedback.highlight = item.highlightText;
      feedback.highlightWithContext = item.highlightTextContext;
      feedback.comment = item.comment; 
    }
  });
  sendFeedbackToDB(feedback);
}

function rerenderComponentsVisibility(){
  state.items.map( item => {
    if (item.visible){
      let itemForms = document.querySelectorAll(`mark[h_id = "${item.id}"] form`);
      itemForms.forEach(form => {
        form.classList.remove("hidden");
      });
    }
    else {
      let itemForms = document.querySelectorAll(`mark[h_id = "${item.id}"] form`);
      itemForms.forEach(form => {
        form.classList.add("hidden");
      });
    }
  })
}


// Sending Report 
//-------------------------------------------


function getUserId(){
  if (storageAvailable('localStorage')) {
    var userId = getUserIdFromStorage();
    if (userId) {
      return userId;
    } else {
      return createUserId();
    }
  }
  else {
    return "anonymous";
  }
}
function getUserIdFromStorage() {
  return localStorage.getItem('speakabout_userId');
}
function createUserId() {
  var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  localStorage.setItem('speakabout_userId', id);
  return id;
}





function sendFeedbackToDB(feedback){

  var userId = getUserId();
  var highlight = feedback.highlight; 
  var highlightWithContext = feedback.highlightWithContext;
  var comment = feedback.comment; 
  var pageName = document.title;
  var pageURL = document.location.href;
  var adminHref = sa_ajax.ajaxurl;  

  // var obj = {};
  // obj.userId = userId;
  // obj.highlight = highlight;
  // obj.highlightWithContext = highlightWithContext;
  // obj.comment = comment;
  // obj.pageName = pageName;
  // obj.pageURL = pageURL;
  //console.table(obj);

  var mailData = { 'action': 'siteWideMessage', 'userId': userId, 'highlight': highlight, 'highlightWithContext': highlightWithContext, 'comment': comment, 'pageName': pageName, 'pageURL': pageURL};
  console.log("posting feedback");
  $.post(adminHref, mailData, function (response) {
    console.log('Response: ', response);
  });
  
};



  //If I'd like the ability to see highlights in context on an actual page it is possible
  // use rangy serialize https://github.com/timdown/rangy/wiki/Highlighter-Module 



//Rangy Code worth remembering
/* alert(rangy.getSelection());                               -- gets the highlight selection 
let elem = getHighlightEl(tag);                               --- get the element highlight
let fText = elem.getRange().nativeRange.commonAncestorContainer.innerText;  -- gets the parent container text
let rangeStart = elem.characterRange.start;                   -- character ranges
let getRange = elem.getRange()                                -- element range
let parentText = getRange.commonAncestorContainer.innerText;  --- the parent that contains the bigger chunk of text
let highlightText = getRange.endContainer.data;               --- the string of the highlighted text
let startOffset = getRange.startOffset;                       --- the offset of the highlight from the beginning of the element
let start = getRange.startContainer.data;                     --- all the preceding text before highlight in that element 
let startIndex = parentText.indexOf(start)                    --- how far off of parentText our start text begins
let beginningOffset = startIndex + startOffset;
let preHighlightText = parentText.slice(0, beginningOffset)
let postHighlightText = parentText.slice(startOfPostHighlight)
*/


function storageAvailable(type) {
  //check if localstorage is available. From https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}

setupSpeakAbout()

});
}(jQuery))