/* --------------------------
Speak About
A plugin for inline blog comments. https://github.com/benreimer9/speak-about
Utilizes the Rangy library for range and selection, MIT License https://github.com/timdown/rangy

https://github.com/timdown/rangy/wiki/

 -------------------------- */
 var s; 
 var z;
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

var state = {
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
  setupMobile();

  document.addEventListener('mouseup', () => {
    var highlight = document.getSelection();
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
    var style = document.createElement('style');
    style.innerHTML = `
      #speakaboutWrapper mark.h_item {
        background-color: ${highlightColor};
      }
      #speakaboutWrapper mark.h_item .h_comment .h_close {
        border-color: ${highlightColor};
      }
      #speakaboutWrapper mark.h_item .h_comment.hidden .h_close {
        background-color: ${highlightColor};
      }
      #speakaboutWrapper ::selection {
          background-color: ${highlightColor} !important;
      }
      #speakaboutWrapper mark.h_item.submitted.h_blend.hidden .h_wrapper .h_submit{
        background-color: ${highlightColor};
      }
    `;
    document.querySelector("body").insertAdjacentElement("afterbegin", style)
  }
}



// NEW ITEM 
//-------------------------------------------
// Building a new item, which can be composed of multiple <mark> tags but one itemId to unify them 
function buildNewItem(){
  if (!highlightIsWithinWrapper()) return;
  highlighter.highlightSelection("h_item", { exclusive: false });
  var newMarkTags = findNewMarkTags();
  var itemId = null;
  newMarkTags.forEach(tag => {
    if (itemId === null){
      itemId = getIdFromTag(tag) //on multi-tag highlights the last getIdFromHighlight fails for unknown reasons this if statement is a simple way of just avoiding that altogether. Only get it the first time, then store.
    } 
    addIdToTag(tag, itemId);
    addCommentComponent(tag, itemId);
    addItemToState(tag, itemId);
  });
  removeExtraCommentComponents(itemId);
}

function highlightIsWithinWrapper(){
  var highlightEl = window.getSelection().anchorNode.parentNode;
  if ($(highlightEl).closest("#speakaboutWrapper").length === 0){
    return false;
  }
  else {
    return true;
  }
}

function getHighlightEl(tag){
  return highlighter.getHighlightForElement(tag);
}

function findNewMarkTags(){
  // new mark tags do not have h_id attributes 
  var newMarktags = [];
  var allMarkTags = document.querySelectorAll("mark");
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
  //make a separate hidden copy of the highlight and text I can manipulate to get the proper format. Remove once compvare.
  var elem = getHighlightEl(tag);
  var getRange = elem.getRange()
  var parentElement = getRange.commonAncestorContainer.innerHTML;
  var shadowElement = `<div id="SA_SHADOW" style="display:none"></div>`;
  document.querySelector("body").insertAdjacentHTML("beforeend", shadowElement);
  document.querySelector('#SA_SHADOW').innerHTML = parentElement;

  //remove comments from the shadow version
  var shadowComments = document.querySelectorAll(`#SA_SHADOW .h_comment`);
  shadowComments.forEach(el => {
    el.remove();
  });

  //reform the highlight with a span and inline CSS so the highlight appears in the email
  var highlightItemsList = document.querySelectorAll(`#SA_SHADOW mark[h_id="${itemId}"]`);
  var startHighlightStyling = `<span class="SA_HIGHLIGHT" style="line-height: 12px; font-size: 16px; margin: 0; padding:3px; background-color:#ffc2c2">`
  var endHighlightStyling = `</span>`;
  var lastHighlightTextLength; //this will be needed later
  highlightItemsList.forEach(item => {
    item.innerText = startHighlightStyling + item.innerText + endHighlightStyling;
    lastHighlightTextLength = item.innerText.length; 
  })

  var plainTextShadow = document.querySelector("#SA_SHADOW").innerText;
  var firstHighlightPos = plainTextShadow.indexOf(`<span class="SA_HIGHLIGHT"`); //finds first highlight
  var lastHighlightPos = plainTextShadow.lastIndexOf(`<span class="SA_HIGHLIGHT"`); //finds last highlight
  var numOfExtraCharactersForContext = 150; 
  var startingDots = "...";
  var endingDots = "...";

  var sliceStartPoint = firstHighlightPos - numOfExtraCharactersForContext;
  if (sliceStartPoint <= 0){
    sliceStartPoint = 0;
    startingDots = "";
  } 
  var sliceEndPoint = lastHighlightPos + lastHighlightTextLength + numOfExtraCharactersForContext;
  if (sliceEndPoint > plainTextShadow.length){
    sliceEndPoint = plainTextShadow.length;
    endingDots = "";
  } 
  var shortenedPlainTextShadow = plainTextShadow.slice(sliceStartPoint, sliceEndPoint);
  var reportHTML = `<p>${startingDots}${shortenedPlainTextShadow}${endingDots}</p>`;

  document.querySelector('#SA_SHADOW').remove();
  return reportHTML;

  // TODO further sanitizing for code 
  // hypothetically a user could write code in their comment that stays as a string until
  // I send it out in the email, then gets converted to html / css 
}

function itemIsAlreadyInState(id){
  var numOfTagsPerId = [];
  numOfTagsPerId = state.items.filter(item => {
    return item.id === id;
  })
  return numOfTagsPerId.length !== 0 
}

function addIdToTag(tag, itemId){
  tag.setAttribute("h_id", itemId);
}

function getIdFromTag(tag) {
  return highlighter.getHighlightForElement(tag).id;
}

function removeExtraCommentComponents(itemId){
  
  //check number of tags for the Id. If multiple tags, remove all comments but the last 
  var numberOfTags;
  state.items.map( item => {
    if (item.id === itemId) numberOfTags = item.numOfTags;
  })
  
  var commentComponentList; 
  if (numberOfTags > 1){
    commentComponentList = document.querySelectorAll(`mark[h_id = "${itemId}"] .h_wrapper`);
    for (i = 0; i < numberOfTags; i++) {
      if (i != numberOfTags - 1) {
        commentComponentList[i].remove(); 
      }
    }
  }
}



// MOBILE
//-------------------------------------------

function setupMobile(){
  if (isMobile()){
    console.log('is mobile');
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
  var mobileBtn = document.querySelector("#sa_commentBtn");
  if (mobileBtn) {
    mobileBtn.remove();
  }
}





// COMMENTS
//-------------------------------------------

const commentHTML =
"<div class='h_wrapper'>" + 
  "<form class='h_comment'>" +
    "<input type='text' name='comment' placeholder='Comment' autocomplete='false'>" + 
  "</form>" +
  "<div class='h_submit'>" + 
    '<svg width="10px" height="10px" viewBox="0 0 13 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
      '<g id="Version-Three---WP" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">' +
          '<g id="Artboard" transform="translate(-1507.000000, -412.000000)" fill="#8E8E8E" fill-rule="nonzero">' +
              '<g id="confirm" transform="translate(1507.000000, 412.000000)">' +
                  '<polygon id="Path" points="3.5456019 10 0 6.66666667 1.18159716 5.55580952 3.5456019 7.77828571 11.8184028 0 13 1.1116"></polygon>' +
              '</g>' +
          '</g>' +
      '</g>' +
    '</svg>' + 
  "</div>" + 
  "<div class='h_cancel'>" + 
    '<svg width="9px" height="2px" viewBox="0 0 12 2" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<g id="Version-Three---WP" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">' + 
            '<g id="Artboard" transform="translate(-1507.000000, -460.000000)" fill="#8E8E8E">' + 
                '<rect id="cancel" x="1507" y="460" width="12" height="2"></rect>' + 
            '</g>' + 
        '</g>' + 
    '</svg>' + 
  "</div>" + 
"</div>"

function addCommentComponent(tag, itemId){
  tag.insertAdjacentHTML("beforeend", commentHTML);
  addEventListenersToComment(itemId);
  //document.getSelection().removeAllRanges(); //remove the browser highlight and keep just the CSS one for better UX
}

function addEventListenersToComment(itemId) {

  //submit on enter key
  var itemMarkTags = document.querySelectorAll(`mark[h_id = "${itemId}"]`);
  itemMarkTags.forEach(tag => {
    tag.addEventListener("submit", event => {
      event.preventDefault();
      submitComment(tag, itemId);
      tag.classList.add("submitted");
      closeComment(itemId);
    })
  });

  //open / close on submit icon click
  var submitButtons = document.querySelectorAll(`mark[h_id = "${itemId}"] .h_submit`);
  submitButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      let tag = btn.closest("mark");
      if (tag.classList.contains('hidden')){
        toggleCommentVisibility(itemId)
      }
      else {
        submitComment(tag, itemId);
        tag.classList.add("submitted");
        closeComment(itemId);
      }      
    })
  });

  // delete comment
  var deleteButtons = document.querySelectorAll(`mark[h_id = "${itemId}"] .h_cancel`);
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      deleteComment(itemId)
    })
  });
}

function closeComment(itemId) {
  setTimeout(() => {
    toggleCommentVisibility(itemId);
    setTimeout(() => {
      addSubmitBtnColor(itemId);
    }, 500)
  }, 500);
}


function toggleCommentVisibility(itemId) {
  state.items.map(item => {
    if (item.id === itemId) {
      item.visible = !item.visible;
      rerenderComponentsVisibility();
    }
  })
}

function addSubmitBtnColor(itemId){
  state.items.map(item => {
    if (item.id === itemId) {
      let tag = document.querySelector(`mark[h_id = "${itemId}"]`);
      tag.classList.add("h_blend");
    }
  })
}

function submitComment(tag, itemId){
  var inputField = tag.querySelector("input");
  inputField.blur();
  //take innerText, add to state ID 
  var comment = document.querySelector(`mark[h_id = "${itemId}"] input`).value;
  state.items.forEach(item => {
    if (item.id === itemId){
      item.comment = comment; 
    }  
  });

  if (comment !== ""){
    buildFeedbackObj(itemId);
  }
}

function deleteComment(itemId) {
  console.log('deleting comment');
  //remove from state
  let newItems = state.items.filter(item => {
    if ( item.id !== itemId ){
      return item;
    }
    else {
      var itemClasslist = document.querySelector(`mark[h_id = "${itemId}"]`).classList;
      if (itemClasslist.contains('submitted')){
        removeCommentFromDB(item); 
      }
    }
  });
  state.items = newItems;

  //remove from html
  let tagsToRemove = document.querySelectorAll(`mark[h_id = "${itemId}"]`);
  let commentsToRemove = document.querySelector(`mark[h_id = "${itemId}"] .h_wrapper`);
  let parentTag = tagsToRemove[0].parentElement;

  commentsToRemove.remove();
  $(tagsToRemove).contents().unwrap();
  parentTag.normalize(); //fix the messed up text nodes back to normal after the unwrap
  
}

function removeCommentFromDB(item){

  var userId = getUserId();
  var highlight = item.highlightText; 
  var highlightWithContext = item.highlightTextContext;
  var comment = item.comment; 
  var pageName = document.title;
  var pageURL = document.location.href;
  var adminHref = sa_ajax.ajaxurl;

 var mailData = {
   'action': 'deleteFeedback',
   'userId': userId,
   'highlight': highlight,
   'highlightWithContext': highlightWithContext,
   'comment': comment,
   'pageName': pageName,
   'pageURL': pageURL
 };

 $.post(adminHref, mailData, function (response) {
   //console.log('Response: ', response);
 });


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
      var itemForms = document.querySelectorAll(`mark[h_id = "${item.id}"]`);
      itemForms.forEach(item => {
        item.classList.remove("hidden");
      });
    }
    else {
      var itemForms = document.querySelectorAll(`mark[h_id = "${item.id}"]`);
      itemForms.forEach(item => {
        item.classList.add("hidden");
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

  $.post(adminHref, mailData, function (response) {
    //console.log('Response: ', response);
  });
  
};



  //If I'd like the ability to see highlights in context on an actual page it is possible
  // use rangy serialize https://github.com/timdown/rangy/wiki/Highlighter-Module 



//Rangy Code worth remembering
/* alert(rangy.getSelection());                               -- gets the highlight selection 
var elem = getHighlightEl(tag);                               --- get the element highlight
var fText = elem.getRange().nativeRange.commonAncestorContainer.innerText;  -- gets the parent container text
var rangeStart = elem.characterRange.start;                   -- character ranges
var getRange = elem.getRange()                                -- element range
var parentText = getRange.commonAncestorContainer.innerText;  --- the parent that contains the bigger chunk of text
var highlightText = getRange.endContainer.data;               --- the string of the highlighted text
var startOffset = getRange.startOffset;                       --- the offset of the highlight from the beginning of the element
var start = getRange.startContainer.data;                     --- all the preceding text before highlight in that element 
var startIndex = parentText.indexOf(start)                    --- how far off of parentText our start text begins
var beginningOffset = startIndex + startOffset;
var preHighlightText = parentText.slice(0, beginningOffset)
var postHighlightText = parentText.slice(startOfPostHighlight)
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