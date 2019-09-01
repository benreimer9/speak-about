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

function getHighlightTextContext(tag, itemId){
  // alert(rangy.getSelection());

  let context = "";

  let elem = getHighlightEl(tag);
  let fullText = elem.getRange().nativeRange.commonAncestorContainer.innerText;
  let rangeStart = elem.characterRange.start;
  // let document = elem.getDocument();
  t = elem.doc.activeElement.innerText;
  y = t.indexOf("living");

  //console.log('el : ', elem);
  // console.log('range : ', elem.characterRange);


//I can do it off of getRange(). 
// a combo of startOffset, the commonAncestorContainer and my own numbers should help me get it
  let getRange = elem.getRange()
  let parentText = getRange.commonAncestorContainer.innerText; //the parent that contains the bigger chunk of text
  let highlightText = getRange.endContainer.data; //the string of the highlighted text
  let startOffset = getRange.startOffset; //the offset of the highlight from the beginning of the element
  let start = getRange.startContainer.data; //all the preceding text before highlight in that element 
  // console.log('get range : ', getRange);
  // console.log('parentText : ', parentText);
  // console.log('highlightText : ', highlightText);
  // console.log('start : ', start);
  // console.log('startOffset : ', startOffset);

  //Hacky Solution for now
  //identify the highlights position by grabbing the full text, finding the start item, counting the offset, and getting the highlight from there
  //could potentially fail in situations with identical repeating text.

  //position would be startIndex + startOffset ? 
  let startIndex = parentText.indexOf(start) //how far off of parentText our start text begins
  let beginningOffset = startIndex + startOffset;
  // console.log('startIndex : ', startIndex);
  // console.log('distance should be : ', startIndex + startOffset);
  // console.log('beginningOffset : ', beginningOffset);
  let highLightTextLength = highlightText.length;
  let startOfPostHighlight = beginningOffset + highLightTextLength;



  let preHighlightText = parentText.slice(0, beginningOffset)
  let postHighlightText = parentText.slice(startOfPostHighlight)
  // console.log('--------OUTPUT ------------');
  // console.log(preHighlightText);
  // console.log(highlightText);
  // console.log(postHighlightText);

  // IDEA TWO
  //grab the html not the text.
  //just paste that in the email
  //or, find the h_item within it, and slice anything more than 50 chars before or after. 
  //note : can't do DOM changes as norm because nothing I do here should actually affect the legit page 
 


  // Idea Three
  // grab 1) ancestor html 2) highlight id 
  // remove comment
  // insert a unique string around the highlight
  // grab ancestor text and put it into a p tag
  // grab the highlight (using the unique string) and highlight that, remove string
  // voila 
  let ancestor = getRange.commonAncestorContainer.innerHTML;

  //I'll make a new div where I can do my manipulation in peace. 
  //first remove all comments.
  let shadowElement = `<div id="SA_SHADOW" style="display:none"></div>`;
  document.querySelector("body").insertAdjacentHTML("beforeend", shadowElement);
  document.querySelector('#SA_SHADOW').innerHTML = ancestor;
  let shadowComments = document.querySelectorAll(`#SA_SHADOW .h_comment`);
  shadowComments.forEach(el => {
    el.remove();
  });
  let h_item = document.querySelector(`#SA_SHADOW mark[h_id="${itemId}"]`);
  let inner = h_item.innerText;
  inner = `<span style="color:red"> ${inner} </span>`;
  h_item.innerText = inner; 

  let plainTextShadow = document.querySelector("#SA_SHADOW").innerText;
  let reportHTML = `<p> ${plainTextShadow} </p>`;
  console.log(document.querySelector('#SA_SHADOW'));
  console.log(reportHTML);
  
  // t = highlighter.highlightCharacterRanges("h_item", [{end:300, start:150}], {containerElementId: null, exclusive: true})
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
<div style="color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
	<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 14px; color: #555555;">
		<p style="font-size: 14px; line-height: 19px; margin: 0; padding:10px;background-color:#FFB5B5">
			<span style="font-size: 16px;">${item.highlightTextContext}</span>
		</p>
	</div>
</div>
<!--[if mso]></td></tr></table><![endif]-->
<!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]-->
<div style="color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
	<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 14px; color: #555555;">
		<p style="font-size: 14px; line-height: 19px; margin: 0;font-size:18px; color:#333; background-color:#f0f0f0;padding:10px;margin:5px 0px;">
			<span style="font-size: 16px;">${item.comment}</span>
		</p>
	</div>
</div>
`

    // report += `<span style="font-size: 16px;">${item.highlightText}</span>`
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





// var ajaxurl = 'http://www.reformeducators.org/wp-content/themes/NATE/admin-ajax.php';
// stringDifference = JSON.stringify(difference);
// stringDropDifference = JSON.stringify(dropDifference);
// stringUsername = String(username);


// $.post(ajaxurl, { 'Name': stringUsername, 'Changes Made': stringDifference, 'Drop Down Menu Changes': stringDropDifference });


setupSpeakAbout()


}(jQuery))