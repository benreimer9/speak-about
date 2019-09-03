/* --------------------------
Speak About
A plugin for inline blog comments. https://github.com/benreimer9/speak-about
Utilizes the Rangy library for range and selection, MIT License https://github.com/timdown/rangy

https://github.com/timdown/rangy/wiki/

 -------------------------- */
let s,t,y,u;
(function ($) {

/* Sprint 2  
- Generate report
- Send report on page close.

Sprint 3
Floating Controls. 
- display number of highlights
- toggle show/hide highlights
- list highlights
- go to highlight on list item click 
Intro paragraph 
- content
- figure out how it should be placed into page content

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

  highlighter.addClassApplier(rangy.createClassApplier("h_item", {
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
s = state;

function setupSpeakAbout(){
  document.addEventListener('mouseup', () => {
    let highlight = document.getSelection();
    if (isNotJustAClick(highlight)) {
      buildNewItem();
    }
  });
  window.addEventListener('beforeunload', (event) => {
    sendReport(event);
  });
}

function isNotJustAClick(highlight) {
  return (highlight.anchorOffset !== highlight.focusOffset);
}


//-------------------------------------------
// Building a new item, which can be composed of multiple <mark> tags but one itemId to unify them 
let highlightInfo;

function buildNewItem(){
  highlighter.highlightSelection("h_item");
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
        item.highlightTextContext = getHighlightTextContext(itemId)
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

function getHighlightTextContext(itemId){
 
  // TODO seperate email formatting from just getting highlight context 

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
  let highlightItem = document.querySelector(`#SA_SHADOW mark[h_id="${itemId}"]`);
  let inner = highlightItem.innerText;
  let newInner = `<span class="SA_HIGHLIGHT" style="line-height: 12px; font-size: 16px; margin: 0; padding:3px; background-color:#ffc2c2">${inner}</span>`;
  highlightItem.innerText = newInner;

  let plainTextShadow = document.querySelector("#SA_SHADOW").innerText;
  let startHighlightPos = plainTextShadow.indexOf(`<span class="SA_HIGHLIGHT"`);
  let numOfExtraCharactersForContext = 200; 
  let startingDots = "...";
  let endingDots = "...";

  let sliceStartPoint = startHighlightPos - numOfExtraCharactersForContext; 
  if (sliceStartPoint <= 0){
    sliceStartPoint = 0;
    startingDots = "";
  } 

  let sliceEndPoint = startHighlightPos + newInner.length + numOfExtraCharactersForContext; 
  if (sliceEndPoint > plainTextShadow.length){
    sliceEndPoint = plainTextShadow.length;
    endingDots = "";
  } 

  let shortenedPlainTextShadow = plainTextShadow.slice(sliceStartPoint, sliceEndPoint);
  let reportHTML = `<p>${startingDots}${shortenedPlainTextShadow}${endingDots}</p>`;

  // TODO further sanitizing for code 
  // hypothetically an author could write code in their text that stays as text until
  // I send it out in the email, then gets converted to html / css / js. 
  return reportHTML;
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

//-------------------------------------------
// Comments

const commentHTML =
  "<form class='h_comment'>" +
    "<input type='text' name='comment' placeholder='Comment' autocomplete='false'>" +
    "<div class='h_close'></div>" +
  "</form>"

function addCommentComponent(tag, itemId){
  tag.insertAdjacentHTML("beforeend", commentHTML);
  addEventListenersToComment(itemId);
  document.getSelection().removeAllRanges(); //remove the browser highlight and keep just the CSS one for better UX
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
    if (item.id === itemId)  item.comment = comment; 
  })
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

//-------------------------------------------
// Sending Report 

//If I'd like the ability to see highlights in context on an actual page it is possible
// use rangy serialize https://github.com/timdown/rangy/wiki/Highlighter-Module 
function sendReport(event){
  event.preventDefault();
  event.returnValue = '';

  let report = "";

  state.items.forEach(item => {
    report += `
  <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]-->
<div style="color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:0px;padding-left:10px;">
	<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 20px; color: #555555;">
			${item.highlightTextContext}</div>
</div>
<!--[if mso]></td></tr></table><![endif]-->
<!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 0px; padding-bottom: 0px; font-family: Arial, sans-serif"><![endif]-->
<div style="color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;line-height:120%;padding-top:0px;padding-right:10px;padding-bottom:20px;padding-left:10px;">
	<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 14px; color: #555555;">
		<p style="font-size: 14px; line-height: 24px; margin: 0;font-size:18px; color:#333; background-color:#f0f0f0;padding:10px;margin:2px 0px;">
			<span style="font-size: 18px;">${item.comment}</span>
		</p>
	</div>
</div>
`

  })

  // console.log('report : ', report);

  sendMail(report)

}

$(document).ready( function(){
  // document.querySelector("#contact").addEventListener("submit", e => {
  //    e.preventDefault() 
  //   var highlight = "highlight1"
  //   var comment = "comment2"
  //   var email = "email3"
  //   sendMail(highlight, comment, email)
  // });
});


function sendMail(report){

  let title = document.title;
  let titleUrl = document.location.href;
  console.log('title ::: ', title);
  var adminHref = sa_ajax.ajaxurl;  
  var mailData = { 'action': 'siteWideMessage', 'report': report, 'title': title, 'title_url': titleUrl};

  $.post(adminHref, mailData, function (response) {
    console.log('Response: ', response);
  });
  

};





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

setupSpeakAbout()


}(jQuery))